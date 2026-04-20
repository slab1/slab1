import { useMemo } from 'react';

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  noScripts?: boolean;
  noSql?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useInputValidation() {
  const validateInput = useMemo(() => {
    return (value: string, rules: ValidationRules): ValidationResult => {
      const errors: string[] = [];
      
      // Required validation
      if (rules.required && (!value || value.trim().length === 0)) {
        errors.push('This field is required');
      }
      
      // Length validations
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Minimum length is ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Maximum length is ${rules.maxLength} characters`);
      }
      
      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push('Invalid format');
      }
      
      // Email validation
      if (rules.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push('Invalid email format');
        }
      }
      
      // Phone validation
      if (rules.phone) {
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-()]/g, ''))) {
          errors.push('Invalid phone number format');
        }
      }
      
      // URL validation
      if (rules.url) {
        try {
          const url = new URL(value);
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push('Invalid URL format');
          }
        } catch {
          errors.push('Invalid URL format');
        }
      }
      
      // Security validations
      if (rules.noScripts) {
        const scriptRegex = /<script[^>]*>.*?<\/script>/gi;
        const onEventRegex = /on\w+\s*=/gi;
        const jsRegex = /javascript:/gi;
        
        if (scriptRegex.test(value) || onEventRegex.test(value) || jsRegex.test(value)) {
          errors.push('Invalid content detected');
        }
      }
      
      if (rules.noSql) {
        const sqlKeywords = [
          'select', 'insert', 'update', 'delete', 'drop', 'create', 'alter',
          'union', 'script', 'exec', 'execute', '--', ';--', 'xp_'
        ];
        
        const normalizedValue = value.toLowerCase();
        if (sqlKeywords.some(keyword => normalizedValue.includes(keyword))) {
          errors.push('Invalid content detected');
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    };
  }, []);
  
  const validateForm = useMemo(() => {
    return (formData: Record<string, string>, rules: Record<string, ValidationRules>): ValidationResult => {
      const allErrors: string[] = [];
      
      for (const [fieldName, fieldValue] of Object.entries(formData)) {
        if (rules[fieldName]) {
          const result = validateInput(fieldValue, rules[fieldName]);
          if (!result.isValid) {
            allErrors.push(...result.errors.map(error => `${fieldName}: ${error}`));
          }
        }
      }
      
      return {
        isValid: allErrors.length === 0,
        errors: allErrors
      };
    };
  }, [validateInput]);
  
  return {
    validateInput,
    validateForm
  };
}