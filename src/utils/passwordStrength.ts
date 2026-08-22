export interface PasswordStrengthResult {
  score: 'Weak' | 'Medium' | 'Strong';
  percent: number;
  isStrong: boolean;
  message: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const p = password || '';
  
  const hasMinLength = p.length >= 8;
  const hasUppercase = /[A-Z]/.test(p);
  const hasLowercase = /[a-z]/.test(p);
  const hasNumber = /[0-9]/.test(p);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(p);

  if (!p) {
    return {
      score: 'Weak',
      percent: 0,
      isStrong: false,
      message: 'Enter a password',
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
    };
  }

  // Strong criteria: 8+ chars AND contains uppercase, lowercase, number, AND special symbol
  const isStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  if (isStrong) {
    return {
      score: 'Strong',
      percent: 100,
      isStrong: true,
      message: 'Strong password — Meets all enterprise security requirements!',
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    };
  }

  // Medium criteria: 8+ chars with at least 3 criteria satisfied
  const criteriaMetCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;
  if (hasMinLength && criteriaMetCount >= 2) {
    return {
      score: 'Medium',
      percent: 66,
      isStrong: false,
      message: 'Medium password — Include uppercase, number, and special symbol (e.g. @, #, $)',
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    };
  }

  return {
    score: 'Weak',
    percent: 33,
    isStrong: false,
    message: 'Weak password — Must be at least 8 characters with letters, numbers, and symbols',
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };
}
