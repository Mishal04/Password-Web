const GeneratedPassword  = require("../models/GeneratedPassword");
const generatePassword   = require("../utils/passwordGenerator");
const checkStrength      = require("../utils/passwordStrength");

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Return "Very Strong" for long passwords with all character types.
 * Server strength checker only returns Weak/Medium/Strong, so we extend it.
 */
const extendedStrength = (password) => {
  const base = checkStrength(password);

  const hasUpper   = /[A-Z]/.test(password);
  const hasLower   = /[a-z]/.test(password);
  const hasNumber  = /[0-9]/.test(password);
  const hasSymbol  = /[^A-Za-z0-9]/.test(password);
  const longEnough = password.length >= 16;

  if (base === "Strong" && longEnough && hasUpper && hasLower && hasNumber && hasSymbol) {
    return "Very Strong";
  }
  return base;
};

/**
 * Calculate Shannon entropy in bits.
 * entropy = length * log2(poolSize)
 */
const calculateEntropy = (password, options) => {
  const SIMILAR   = new Set("0Oo1lIi|");
  const AMBIGUOUS = new Set("{}[]()/\\'\"`,.;:<>~");

  const filter = (str) =>
    str
      .split("")
      .filter((c) => !(options.excludeSimilar   && SIMILAR.has(c)))
      .filter((c) => !(options.excludeAmbiguous && AMBIGUOUS.has(c)))
      .join("").length;

  let poolSize = 0;
  if (options.uppercase) poolSize += filter("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (options.lowercase) poolSize += filter("abcdefghijklmnopqrstuvwxyz");
  if (options.numbers)   poolSize += filter("0123456789");
  if (options.symbols)   poolSize += filter("!@#$%^&*()_+-=[]{}|;:,.<>?/~`");

  if (poolSize === 0) return 0;
  return Math.round(password.length * Math.log2(poolSize) * 10) / 10;
};

// ─── Preset definitions ──────────────────────────────────────────────────────

const PRESETS = {
  banking: {
    length: 20, uppercase: true, lowercase: true,
    numbers: true, symbols: true, excludeSimilar: true, excludeAmbiguous: true,
  },
  social: {
    length: 16, uppercase: true, lowercase: true,
    numbers: true, symbols: true, excludeSimilar: false, excludeAmbiguous: false,
  },
  gaming: {
    length: 14, uppercase: true, lowercase: true,
    numbers: true, symbols: false, excludeSimilar: true, excludeAmbiguous: false,
  },
  email: {
    length: 16, uppercase: true, lowercase: true,
    numbers: true, symbols: false, excludeSimilar: true, excludeAmbiguous: true,
  },
  developer: {
    length: 32, uppercase: true, lowercase: true,
    numbers: true, symbols: true, excludeSimilar: false, excludeAmbiguous: false,
  },
  wifi: {
    length: 24, uppercase: true, lowercase: true,
    numbers: true, symbols: false, excludeSimilar: true, excludeAmbiguous: true,
  },
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/generator
 * Body: { length, uppercase, lowercase, numbers, symbols,
 *         excludeSimilar, excludeAmbiguous, preset }
 */
const generateAndSave = async (req, res) => {
  try {
    let options = {
      length:           Number(req.body.length)           || 16,
      uppercase:        req.body.uppercase        !== false,
      lowercase:        req.body.lowercase        !== false,
      numbers:          req.body.numbers          !== false,
      symbols:          req.body.symbols          !== false,
      excludeSimilar:   !!req.body.excludeSimilar,
      excludeAmbiguous: !!req.body.excludeAmbiguous,
    };

    const preset = req.body.preset || null;

    // Apply preset overrides if provided
    if (preset && PRESETS[preset.toLowerCase()]) {
      options = { ...options, ...PRESETS[preset.toLowerCase()] };
    }

    // Clamp length
    options.length = Math.min(64, Math.max(8, options.length));

    const password = generatePassword(
      options.length,
      options.uppercase,
      options.lowercase,
      options.numbers,
      options.symbols,
      options.excludeSimilar,
      options.excludeAmbiguous
    );

    const strength = extendedStrength(password);
    const entropy  = calculateEntropy(password, options);

    // Persist to history (enforce max 10 per user — remove oldest if needed)
    const count = await GeneratedPassword.countDocuments({ userId: req.user._id });
    if (count >= 10) {
      const oldest = await GeneratedPassword
        .find({ userId: req.user._id })
        .sort({ createdAt: 1 })
        .limit(count - 9);
      const ids = oldest.map((d) => d._id);
      await GeneratedPassword.deleteMany({ _id: { $in: ids } });
    }

    const record = await GeneratedPassword.create({
      userId:   req.user._id,
      password,
      strength,
      length:   options.length,
      options:  {
        uppercase:        options.uppercase,
        lowercase:        options.lowercase,
        numbers:          options.numbers,
        symbols:          options.symbols,
        excludeSimilar:   options.excludeSimilar,
        excludeAmbiguous: options.excludeAmbiguous,
      },
      preset,
      entropy,
    });

    res.status(201).json({
      success:  true,
      password,
      strength,
      entropy,
      length:   options.length,
      options,
      preset,
      id:       record._id,
      createdAt: record.createdAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/generator/history
 * Returns the 10 most recent generated passwords for the logged-in user.
 */
const getHistory = async (req, res) => {
  try {
    const history = await GeneratedPassword
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/generator/history
 * Clears all generated password history for the logged-in user.
 */
const clearHistory = async (req, res) => {
  try {
    await GeneratedPassword.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, message: "History cleared." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateAndSave, getHistory, clearHistory, PRESETS };
