// ─── Form Validators ────────────────────────────────────────────────────────

/** Minimum password length */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validates an email address format.
 * @param email - Email string to validate
 * @returns Error message or empty string if valid
 */
export function validateEmail(email: string): string {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!regex.test(email)) return 'Invalid email address';
  return '';
}

/**
 * Validates a password meets minimum requirements.
 * @param password - Password string to validate
 * @returns Error message or empty string if valid
 */
export function validatePassword(password: string): string {
  if (!password) return 'Password is required';
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  return '';
}

/**
 * Validates that two passwords match.
 * @param password - Original password
 * @param confirm - Confirmation password
 * @returns Error message or empty string if valid
 */
export function validatePasswordMatch(password: string, confirm: string): string {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return '';
}

/**
 * Validates a required name field.
 * @param name - Name string to validate
 * @returns Error message or empty string if valid
 */
export function validateName(name: string): string {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return '';
}

/**
 * Validates a positive numeric amount.
 * @param amount - Amount value
 * @returns Error message or empty string if valid
 */
export function validateAmount(amount: number): string {
  if (!amount) return 'Amount is required';
  if (amount <= 0) return 'Amount must be greater than 0';
  return '';
}
