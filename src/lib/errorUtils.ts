/**
 * Security utility to sanitize error messages before displaying to users
 * Prevents information leakage about database structure and internal systems
 */

interface ErrorMapping {
  [key: string]: string;
}

const ERROR_MESSAGES: ErrorMapping = {
  // PostgreSQL error codes
  '23505': 'This record already exists. Please try again with different details.',
  '23503': 'The referenced record was not found. Please check your input.',
  '23502': 'Required information is missing. Please fill in all required fields.',
  '42501': 'You do not have permission to perform this action.',
  '42P01': 'The requested resource could not be found.',
  
  // Supabase/PostgREST errors
  'PGRST116': 'No data was found for your request.',
  'PGRST301': 'You do not have permission to perform this action.',
  
  // Auth errors
  'invalid_credentials': 'Invalid email or password. Please try again.',
  'email_not_confirmed': 'Please verify your email address before logging in.',
  'user_already_exists': 'An account with this email already exists.',
};

/**
 * Convert a database/system error into a safe user-friendly message
 * Logs the full error details for debugging (in dev) while showing safe messages to users
 */
export function getSafeErrorMessage(error: any): string {
  // Log full error in development only
  if (import.meta.env.DEV) {
    console.error('Error details (dev only):', error);
  }
  
  // Check for specific error codes
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  // Check for auth error messages
  if (error?.message) {
    const lowerMessage = error.message.toLowerCase();
    
    if (lowerMessage.includes('invalid') && lowerMessage.includes('credentials')) {
      return ERROR_MESSAGES['invalid_credentials'];
    }
    if (lowerMessage.includes('email') && lowerMessage.includes('confirm')) {
      return ERROR_MESSAGES['email_not_confirmed'];
    }
    if (lowerMessage.includes('already') && lowerMessage.includes('exists')) {
      return ERROR_MESSAGES['user_already_exists'];
    }
  }
  
  // Default safe message
  return 'An error occurred while processing your request. Please try again later.';
}

/**
 * Luhn algorithm to validate credit card numbers
 */
export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}
