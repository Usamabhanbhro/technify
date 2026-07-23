/**
 * Password Validation Utility
 * Ensures passwords meet security requirements
 */

const passwordValidationRules = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  // Length validation
  if (password.length < passwordValidationRules.minLength) {
    errors.push(`Password must be at least ${passwordValidationRules.minLength} characters long`);
  }

  if (password.length > passwordValidationRules.maxLength) {
    errors.push(`Password must not exceed ${passwordValidationRules.maxLength} characters`);
  }

  // Uppercase validation
  if (passwordValidationRules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  // Lowercase validation
  if (passwordValidationRules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  // Number validation
  if (passwordValidationRules.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Special character validation
  if (passwordValidationRules.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }

  // Common passwords to avoid
  const commonPasswords = [
    'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
    'letmein', 'welcome', 'monkey', 'dragon', 'admin', 'test', '1234'
  ];

  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate password requirements string for UI
 * @returns {string} - Requirements description
 */
const getPasswordRequirements = () => {
  const requirements = [];
  requirements.push(`At least ${passwordValidationRules.minLength} characters`);
  if (passwordValidationRules.requireUppercase) requirements.push('One uppercase letter (A-Z)');
  if (passwordValidationRules.requireLowercase) requirements.push('One lowercase letter (a-z)');
  if (passwordValidationRules.requireNumber) requirements.push('One number (0-9)');
  if (passwordValidationRules.requireSpecialChar) requirements.push('One special character (!@#$%^&*)');
  
  return requirements.join(', ');
};

/**
 * Check if new password is same as old passwords
 * @param {string} newPassword - New password
 * @param {array} oldPasswordHashes - Array of old password hashes from history
 * @param {string} bcrypt - bcrypt module for comparison
 * @returns {Promise<boolean>} - true if password was used before
 */
const isPasswordReused = async (newPassword, oldPasswordHashes, bcrypt) => {
  if (!oldPasswordHashes || oldPasswordHashes.length === 0) {
    return false;
  }

  for (const oldHash of oldPasswordHashes) {
    const isMatch = await bcrypt.compare(newPassword, oldHash);
    if (isMatch) {
      return true;
    }
  }

  return false;
};

/**
 * Calculate password strength (0-4)
 * @param {string} password - Password to evaluate
 * @returns {object} - { strength: number, label: string, color: string }
 */
const calculatePasswordStrength = (password) => {
  let strength = 0;

  if (!password) {
    return { strength: 0, label: 'None', color: 'gray' };
  }

  // Length scoring
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Complexity scoring
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;

  // Cap at 4
  strength = Math.min(strength, 4);

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['red', 'orange', 'yellow', 'lightgreen', 'green'];

  return {
    strength,
    label: labels[strength],
    color: colors[strength],
  };
};

module.exports = {
  validatePassword,
  getPasswordRequirements,
  isPasswordReused,
  calculatePasswordStrength,
  passwordValidationRules,
};
