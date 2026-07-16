const crypto = require("crypto");

/**
 * Cryptographically secure password generator using Node's crypto module.
 * Never uses Math.random().
 *
 * @param {number}  length            - Password length (8–64)
 * @param {boolean} includeUppercase
 * @param {boolean} includeLowercase
 * @param {boolean} includeNumbers
 * @param {boolean} includeSymbols
 * @param {boolean} excludeSimilar    - Exclude visually similar chars: 0Oo1lIi|
 * @param {boolean} excludeAmbiguous  - Exclude shell/quote chars: {}[]()/\'"`,;:.<>
 */
const generatePassword = (
  length = 16,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true,
  excludeSimilar = false,
  excludeAmbiguous = false
) => {
  const SIMILAR   = new Set("0Oo1lIi|");
  const AMBIGUOUS = new Set("{}[]()/\\'\"`,.;:<>~");

  const filter = (str) =>
    str
      .split("")
      .filter((c) => !(excludeSimilar && SIMILAR.has(c)))
      .filter((c) => !(excludeAmbiguous && AMBIGUOUS.has(c)))
      .join("");

  const UPPER   = filter("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  const LOWER   = filter("abcdefghijklmnopqrstuvwxyz");
  const NUMBERS = filter("0123456789");
  const SYMBOLS = filter("!@#$%^&*()_+-=[]{}|;:,.<>?/~`");

  let pool = "";
  const required = [];

  if (includeUppercase && UPPER)   { pool += UPPER;   required.push(UPPER); }
  if (includeLowercase && LOWER)   { pool += LOWER;   required.push(LOWER); }
  if (includeNumbers   && NUMBERS) { pool += NUMBERS; required.push(NUMBERS); }
  if (includeSymbols   && SYMBOLS) { pool += SYMBOLS; required.push(SYMBOLS); }

  if (!pool) {
    throw new Error("At least one character type must be selected.");
  }

  /**
   * Unbiased random integer in [0, max) using rejection sampling.
   * Avoids modulo bias by discarding values that would skew distribution.
   */
  const randomIndex = (max) => {
    const byteCount  = Math.ceil(Math.log2(max) / 8) + 1;
    const maxValid   = Math.floor(256 ** byteCount / max) * max;
    let val;
    do {
      const buf = crypto.randomBytes(byteCount);
      val = buf.reduce((acc, b) => acc * 256 + b, 0);
    } while (val >= maxValid);
    return val % max;
  };

  // Build password: ensure at least one char from each required set
  const chars = [];

  // Fill required slots first
  for (const set of required) {
    chars.push(set[randomIndex(set.length)]);
  }

  // Fill remaining slots from full pool
  while (chars.length < length) {
    chars.push(pool[randomIndex(pool.length)]);
  }

  // Fisher-Yates shuffle using crypto randomness
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
};

module.exports = generatePassword;
