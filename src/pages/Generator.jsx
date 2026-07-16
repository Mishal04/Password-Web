import { useState, useEffect, useCallback, useRef } from "react";
import {
  FiKey,
  FiCopy,
  FiRefreshCw,
  FiCheck,
  FiClock,
  FiZap,
  FiShield,
  FiTrash2,
  FiSliders,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar/Sidebar";
import Header  from "../components/Header/Header";
import Toast   from "../components/Toast/Toast";
import API     from "../services/api";

import { calculateEntropy, estimateCrackTime, getStrengthLabel } from "../utils/entropyUtils";
import "./Generator.css";
import "./Dashboard.css"; // .dashboard + .dashboard-content layout shell

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS = {
  length:           16,
  uppercase:        true,
  lowercase:        true,
  numbers:          true,
  symbols:          true,
  excludeSimilar:   false,
  excludeAmbiguous: false,
};

const PRESETS = [
  { id: "banking",   name: "Banking",       icon: "🏦", length: 20, uppercase: true,  lowercase: true,  numbers: true,  symbols: true,  excludeSimilar: true,  excludeAmbiguous: true  },
  { id: "social",    name: "Social Media",  icon: "📱", length: 16, uppercase: true,  lowercase: true,  numbers: true,  symbols: true,  excludeSimilar: false, excludeAmbiguous: false },
  { id: "gaming",    name: "Gaming",        icon: "🎮", length: 14, uppercase: true,  lowercase: true,  numbers: true,  symbols: false, excludeSimilar: true,  excludeAmbiguous: false },
  { id: "email",     name: "Email",         icon: "📧", length: 16, uppercase: true,  lowercase: true,  numbers: true,  symbols: false, excludeSimilar: true,  excludeAmbiguous: true  },
  { id: "developer", name: "Developer",     icon: "💻", length: 32, uppercase: true,  lowercase: true,  numbers: true,  symbols: true,  excludeSimilar: false, excludeAmbiguous: false },
  { id: "wifi",      name: "WiFi",          icon: "📶", length: 24, uppercase: true,  lowercase: true,  numbers: true,  symbols: false, excludeSimilar: true,  excludeAmbiguous: true  },
];

const CHECKBOXES = [
  { key: "uppercase",        label: "Uppercase (A–Z)"           },
  { key: "lowercase",        label: "Lowercase (a–z)"           },
  { key: "numbers",          label: "Numbers (0–9)"             },
  { key: "symbols",          label: "Symbols (!@#…)"            },
  { key: "excludeSimilar",   label: "Exclude Similar (0Oo1lI)"  },
  { key: "excludeAmbiguous", label: "Exclude Ambiguous ({}[]…)" },
];

const STRENGTH_COLORS = {
  "Weak":        { color: "#EF4444", tier: 1 },
  "Medium":      { color: "#F59E0B", tier: 2 },
  "Strong":      { color: "#22C55E", tier: 3 },
  "Very Strong": { color: "#8B5CF6", tier: 4 },
};

const STRENGTH_CLASSES = {
  "Weak":        "strength-weak",
  "Medium":      "strength-medium",
  "Strong":      "strength-strong",
  "Very Strong": "strength-very-strong",
};

// ─── Component ───────────────────────────────────────────────────────────────

function Generator() {
  const [password,      setPassword]      = useState("");
  const [options,       setOptions]       = useState(DEFAULT_OPTIONS);
  const [activePreset,  setActivePreset]  = useState(null);
  const [history,       setHistory]       = useState([]);
  const [generating,    setGenerating]    = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [copiedHistId,  setCopiedHistId]  = useState(null);
  const [toast,         setToast]         = useState({ message: "", type: "success" });
  const copiedTimer  = useRef(null);
  const histTimer    = useRef(null);

  // ── Derived values ─────────────────────────────────────────────────────────
  const entropy    = password ? calculateEntropy(password.length, options) : 0;
  const crackTime  = password ? estimateCrackTime(entropy) : "—";
  const { label: strengthLabel, tier } = password
    ? getStrengthLabel(password)
    : { label: "Weak", tier: 0 };
  const strengthColor = STRENGTH_COLORS[strengthLabel]?.color || "#EF4444";

  // Slider fill percentage CSS variable
  const sliderPct = `${((options.length - 8) / (64 - 8)) * 100}%`;

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  // ── History fetch ──────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const res = await API.get("/generator/history");
      if (res.data?.success) setHistory(res.data.history);
    } catch {
      /* silently fail — history is non-critical */
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    return () => {
      clearTimeout(copiedTimer.current);
      clearTimeout(histTimer.current);
    };
  }, [fetchHistory]);

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(
    async (overrideOptions = null, presetId = null) => {
      const opts = overrideOptions || options;

      // Require at least one charset
      if (!opts.uppercase && !opts.lowercase && !opts.numbers && !opts.symbols) {
        showToast("Select at least one character type.", "error");
        return;
      }

      setGenerating(true);
      setCopied(false);

      try {
        const payload = {
          length:           opts.length,
          uppercase:        opts.uppercase,
          lowercase:        opts.lowercase,
          numbers:          opts.numbers,
          symbols:          opts.symbols,
          excludeSimilar:   opts.excludeSimilar,
          excludeAmbiguous: opts.excludeAmbiguous,
          preset:           presetId || null,
        };

        const res = await API.post("/generator", payload);

        if (res.data?.success) {
          setPassword(res.data.password);
          fetchHistory();
        }
      } catch (err) {
        showToast(err.response?.data?.message || "Generation failed.", "error");
      } finally {
        setGenerating(false);
      }
    },
    [options, fetchHistory, showToast]
  );

  // ── Auto-generate on first load ────────────────────────────────────────────
  useEffect(() => {
    handleGenerate(DEFAULT_OPTIONS, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Option change ──────────────────────────────────────────────────────────
  const handleOptionChange = (key, value) => {
    setActivePreset(null);
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // ── Preset select ──────────────────────────────────────────────────────────
  const handlePreset = (preset) => {
    const newOpts = {
      length:           preset.length,
      uppercase:        preset.uppercase,
      lowercase:        preset.lowercase,
      numbers:          preset.numbers,
      symbols:          preset.symbols,
      excludeSimilar:   preset.excludeSimilar,
      excludeAmbiguous: preset.excludeAmbiguous,
    };
    setOptions(newOpts);
    setActivePreset(preset.id);
    handleGenerate(newOpts, preset.id);
  };

  // ── Copy ───────────────────────────────────────────────────────────────────
  const handleCopy = async (text, isHistory = false, histId = null) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isHistory) {
        setCopiedHistId(histId);
        clearTimeout(histTimer.current);
        histTimer.current = setTimeout(() => setCopiedHistId(null), 2000);
      } else {
        setCopied(true);
        clearTimeout(copiedTimer.current);
        copiedTimer.current = setTimeout(() => setCopied(false), 2000);
      }
      showToast("Password copied!");
    } catch {
      showToast("Failed to copy.", "error");
    }
  };

  // ── Clear history ──────────────────────────────────────────────────────────
  const handleClearHistory = async () => {
    if (!window.confirm("Clear all generated password history?")) return;
    try {
      await API.delete("/generator/history");
      setHistory([]);
      showToast("History cleared.");
    } catch {
      showToast("Failed to clear history.", "error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <Header />

        {/* Page heading */}
        <div className="gen-page-header">
          <h1>
            <FiKey
              size={22}
              style={{ verticalAlign: "middle", marginRight: 10, color: "#8B5CF6" }}
            />
            Password Generator
          </h1>
          <p>Generate cryptographically secure passwords with custom rules.</p>
        </div>

        <div className="generator-page">
          {/* ── LEFT COLUMN ───────────────────────────────── */}
          <div className="generator-left">

            {/* Password Display */}
            <div className="gen-card gen-display">
              <div className="gen-card__title">
                <FiShield size={13} />
                Generated Password
              </div>

              <div
                className={`gen-display__password ${!password ? "gen-display__password--empty" : ""}`}
                title="Click to select all"
              >
                {password || "Click Generate to create a password"}
              </div>

              {/* Strength Meter */}
              {password && (
                <div className="gen-strength" style={{ marginBottom: 16 }}>
                  <div className="gen-strength__header">
                    <span className="gen-strength__label" style={{ color: strengthColor }}>
                      Password Strength
                    </span>
                    <span
                      className={`gen-strength__tier-label ${STRENGTH_CLASSES[strengthLabel]}`}
                    >
                      {strengthLabel}
                    </span>
                  </div>

                  <div className="gen-strength__bars">
                    {[1, 2, 3, 4].map((t) => (
                      <div
                        key={t}
                        className={`gen-strength__bar ${tier >= t ? `gen-strength__bar--active-${Math.min(tier, 4)}` : ""}`}
                      />
                    ))}
                  </div>

                  {/* Entropy + Crack Time */}
                  <div className="gen-meta">
                    <div className="gen-meta__item">
                      <span className="gen-meta__item-label">
                        <FiZap size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        Entropy Score
                      </span>
                      <span className="gen-meta__item-value gen-meta__item-value--entropy">
                        {entropy} bits
                      </span>
                    </div>
                    <div className="gen-meta__item">
                      <span className="gen-meta__item-label">
                        <FiClock size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        Est. Crack Time
                      </span>
                      <span className="gen-meta__item-value gen-meta__item-value--crack">
                        {crackTime}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="gen-display__actions">
                <button
                  className={`gen-btn gen-btn--primary ${generating ? "gen-btn--spinning" : ""}`}
                  onClick={() => handleGenerate()}
                  disabled={generating}
                  aria-label="Generate new password"
                >
                  <FiRefreshCw size={15} />
                  {generating ? "Generating…" : "Generate"}
                </button>

                <button
                  className={`gen-btn ${copied ? "gen-btn--copied" : "gen-btn--secondary"}`}
                  onClick={() => handleCopy(password)}
                  disabled={!password}
                  aria-label="Copy password"
                >
                  {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Options Card */}
            <div className="gen-card gen-options">
              <div className="gen-card__title">
                <FiSliders size={13} />
                Customise Password
              </div>

              {/* Length Slider */}
              <div className="gen-length">
                <div className="gen-length__header">
                  <span className="gen-length__label">Password Length</span>
                  <span className="gen-length__value">{options.length}</span>
                </div>

                <input
                  type="range"
                  className="gen-slider"
                  min={8}
                  max={64}
                  value={options.length}
                  onChange={(e) => handleOptionChange("length", Number(e.target.value))}
                  style={{ "--slider-pct": sliderPct }}
                  aria-label="Password length"
                  aria-valuemin={8}
                  aria-valuemax={64}
                  aria-valuenow={options.length}
                />

                <div className="gen-slider-ticks">
                  <span>8</span>
                  <span>16</span>
                  <span>32</span>
                  <span>48</span>
                  <span>64</span>
                </div>
              </div>

              <div className="gen-divider" />

              {/* Checkboxes */}
              <div className="gen-checkboxes">
                {CHECKBOXES.map(({ key, label }) => (
                  <label
                    key={key}
                    className={`gen-checkbox-item ${options[key] ? "gen-checkbox-item--checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!options[key]}
                      onChange={(e) => handleOptionChange(key, e.target.checked)}
                      aria-label={label}
                    />
                    <span className="gen-checkbox-box">
                      {options[key] && <FiCheck size={11} />}
                    </span>
                    <span className="gen-checkbox-text">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────── */}
          <div className="generator-right">

            {/* Quick Presets */}
            <div className="gen-card">
              <div className="gen-card__title">
                <FiZap size={13} />
                Quick Presets
              </div>

              <div className="gen-presets__grid">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`gen-preset-btn ${activePreset === preset.id ? "gen-preset-btn--active" : ""}`}
                    onClick={() => handlePreset(preset)}
                    aria-label={`Apply ${preset.name} preset`}
                    aria-pressed={activePreset === preset.id}
                  >
                    <span className="gen-preset-btn__icon">{preset.icon}</span>
                    <span className="gen-preset-btn__name">{preset.name}</span>
                    <span className="gen-preset-btn__len">{preset.length} chars</span>
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="gen-card">
              <div className="gen-history__header">
                <div className="gen-card__title" style={{ margin: 0 }}>
                  <FiClock size={13} />
                  Recent Passwords
                </div>
                {history.length > 0 && (
                  <button
                    className="gen-history__clear"
                    onClick={handleClearHistory}
                    aria-label="Clear history"
                  >
                    <FiTrash2 size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                    Clear
                  </button>
                )}
              </div>

              <div className="gen-history__list">
                {history.length === 0 ? (
                  <p className="gen-history__empty">
                    No history yet. Generate a password to get started.
                  </p>
                ) : (
                  history.map((item) => {
                    const date = new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric",
                    });
                    const time = new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit",
                    });
                    const strengthClass = STRENGTH_CLASSES[item.strength] || "strength-weak";

                    return (
                      <div className="gen-history__item" key={item._id}>
                        <span className="gen-history__password" title={item.password}>
                          {item.password}
                        </span>
                        <div className="gen-history__meta">
                          <span className={`gen-history__strength ${strengthClass}`}>
                            {item.strength}
                          </span>
                          <span className="gen-history__date">{date} {time}</span>
                        </div>
                        <button
                          className="gen-history__copy"
                          onClick={() => handleCopy(item.password, true, item._id)}
                          title="Copy this password"
                          aria-label="Copy password from history"
                        >
                          {copiedHistId === item._id
                            ? <FiCheck size={13} />
                            : <FiCopy  size={13} />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
}

export default Generator;
