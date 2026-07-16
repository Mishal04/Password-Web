/**
 * Client-side password strength checker.
 * Returns "Weak" | "Medium" | "Strong" and a numeric score 0–5.
 */
export const checkPasswordStrength = (password) => {
  if (!password) return { label: "Weak", score: 0 };

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", score };
  if (score <= 4) return { label: "Medium", score };
  return { label: "Strong", score };
};

export default checkPasswordStrength;
