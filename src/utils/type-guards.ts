// Type guards and type utilities for better type safety

import { ApiErrorResponse } from '@/api/types';

export const isApiError = (data: unknown): data is ApiErrorResponse => {
  return typeof data === 'object' && data !== null && 'error' in data;
};

export const isValidString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isValidDate = (value: unknown): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

export const isValidArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

export const isValidObject = (value: unknown): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

// Safe type assertion with fallback
export const safeTypeAssertion = <T>(
  value: unknown,
  validator: (val: unknown) => val is T,
  fallback: T
): T => {
  return validator(value) ? value : fallback;
};

// Transform and validate data
export const transformWithValidation = <T, U>(
  data: T[],
  transformer: (item: T) => U,
  validator?: (item: U) => boolean
): U[] => {
  return data
    .map(transformer)
    .filter(item => validator ? validator(item) : true);
};