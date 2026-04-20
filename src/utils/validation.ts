
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits');
export const requiredStringSchema = z.string().min(1, 'This field is required');
export const numberSchema = z.number().min(0, 'Must be a positive number');

// Business-specific schemas
export const businessInfoSchema = z.object({
  businessName: requiredStringSchema,
  businessEmail: emailSchema,
  business_phone_number: phoneSchema,
  contactName: requiredStringSchema,
  businessLicense: z.string().optional(),
  taxId: z.string().optional(),
});

export const addressSchema = z.object({
  street: requiredStringSchema,
  city: requiredStringSchema,
  state: requiredStringSchema,
  zipCode: requiredStringSchema,
  country: z.string().default('US'),
});

export const reservationSchema = z.object({
  partySize: z.number().min(1, 'Party size must be at least 1').max(20, 'Party size cannot exceed 20'),
  reservationDate: z.string().min(1, 'Please select a date'),
  reservationTime: z.string().min(1, 'Please select a time'),
  specialRequests: z.string().optional(),
});

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePhone = (phoneNumber: string): boolean => {
  return phoneSchema.safeParse(phoneNumber).success;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Password strength checker
export const checkPasswordStrength = (password: string): { score: number; feedback: string[] } => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score++;
  else feedback.push('Add numbers');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Add special characters');

  return { score, feedback };
};

// HTML escaping for security
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Rate Limiter class
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number = 60000; // 1 minute

  constructor(maxRequests: number) {
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the time window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

export const securityUtils = {
  validateEmail,
  validatePhone,
  sanitizeInput,
  checkPasswordStrength,
  escapeHtml,
  generateCSRFToken,
};
