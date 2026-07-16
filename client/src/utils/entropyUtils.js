/**
 * entropyUtils.js
 * Client-side entropy calculation and crack-time estimation.
 */

const SIMILAR   = new Set("0Oo1lIi|");
const AMBIGUOUS = new Set("{}[]()/\\'\"`,.;:<>~");

/**
 * Calculate the character pool size for given options.
 */
export const getPoolSize = (options) => {
  const filter = (chars) =>
    chars
      .split("")
      .filter((c) => !(options.excludeSimilar   && SIMILAR.has(c)))
      .filter((c) => !(options.excludeAmbiguous && AMBIGUOUS.has(c)))
      .join("").length;

  let pool = 0;
  if (options.uppercase) pool += filter("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (options.lowercase) pool += filter("abcdefghijklmnopqrstuvwxyz");
  if (options.numbers)   pool += filter("0123456789");
  if (options.symbols)   pool += filter("!@#$%^&*()_+-=[]{}|;:,.<>?/~`");
  return pool;
};

/**
 * Shannon entropy in bits: H = length × log₂(poolSize)
 */
export const calculateEntropy = (length, options) => {
  const pool = getPoolSize(options);
  if (!pool) return 0;
  return Math.round(length * Math.log2(pool) * 10) / 10;
};

/**
 * Estimate crack time assuming a 100 billion guesses/second (10^11) attacker
 * (modern GPU cluster / offline attack worst-case).
 *
 * Returns a human-readable string.
 */
export const estimateCrackTime = (entropy) => {
  if (!entropy) return "Instant";

  // Number of possible combinations = 2^entropy
  // Time (seconds) = combinations / guessesPerSecond
  const GUESSES_PER_SECOND = 1e11;

  // Work in log space to avoid Infinity for large entropy
  const log2Combinations = entropy;                          // log₂(2^H) = H
  const log10Combinations = log2Combinations / Math.log2(10); // convert to log₁₀
  const log10GPS          = Math.log10(GUESSES_PER_SECOND);
  const log10Seconds      = log10Combinations - log10GPS;

  if (log10Seconds < 0)    return "Less than a second";
  if (log10Seconds < 1)    return "A few seconds";
  if (log10Seconds < 1.78) return "Less than a minute";  // < 60s

  const MINUTE = 60;
  const HOUR   = MINUTE * 60;
  const DAY    = HOUR   * 24;
  const WEEK   = DAY    * 7;
  const MONTH  = DAY    * 30;
  const YEAR   = DAY    * 365;
  const DECADE = YEAR   * 10;
  const CENTURY= YEAR   * 100;
  const MILLION_YEARS = YEAR * 1e6;
  const BILLION_YEARS = YEAR * 1e9;

  // Thresholds as log₁₀(seconds)
  const thresholds = [
    [Math.log10(MINUTE),       "Less than a minute"    ],
    [Math.log10(HOUR),         "A few minutes"         ],
    [Math.log10(DAY),          "A few hours"           ],
    [Math.log10(WEEK),         "A few days"            ],
    [Math.log10(MONTH),        "A few weeks"           ],
    [Math.log10(YEAR),         "Several months"        ],
    [Math.log10(DECADE),       "A few years"           ],
    [Math.log10(CENTURY),      "Decades"               ],
    [Math.log10(MILLION_YEARS),"Centuries"             ],
    [Math.log10(BILLION_YEARS),"Millions of years"     ],
  ];

  for (const [threshold, label] of thresholds) {
    if (log10Seconds < threshold) return label;
  }

  return "Billions of years";
};

/**
 * Extended 4-tier strength label including "Very Strong".
 */
export const getStrengthLabel = (password) => {
  if (!password) return { label: "Weak", tier: 0 };

  let score = 0;
  if (password.length >= 8)            score++;
  if (/[A-Z]/.test(password))          score++;
  if (/[a-z]/.test(password))          score++;
  if (/[0-9]/.test(password))          score++;
  if (/[^A-Za-z0-9]/.test(password))   score++;

  const long = password.length >= 16;
  const allTypes = score === 5;

  if (allTypes && long)  return { label: "Very Strong", tier: 4 };
  if (score === 5)       return { label: "Strong",      tier: 3 };
  if (score >= 3)        return { label: "Medium",      tier: 2 };
  return                        { label: "Weak",        tier: 1 };
};
