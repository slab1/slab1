
import { Restaurant, RestaurantLocation, MenuItem } from '@/api/types';

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  type: 'format' | 'missing' | 'logic' | 'consistency';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  score: number; // 0-100
}

/**
 * Validates a restaurant's core data
 */
export const validateRestaurantData = (restaurant: Restaurant): ValidationResult => {
  const issues: ValidationIssue[] = [];

  // Mandatory fields
  if (!restaurant.name?.trim()) {
    issues.push({ field: 'name', message: 'Restaurant name is required', severity: 'error', type: 'missing' });
  }
  if (!restaurant.cuisine?.trim()) {
    issues.push({ field: 'cuisine', message: 'Cuisine type is required', severity: 'error', type: 'missing' });
  }

  // Format checks
  if (restaurant.slug && !/^[a-z0-9-]+$/.test(restaurant.slug)) {
    issues.push({ field: 'slug', message: 'Slug must contain only lowercase letters, numbers, and hyphens', severity: 'error', type: 'format' });
  }

  // Business hours logic
  if (restaurant.opening_hours) {
    try {
      const hours = typeof restaurant.opening_hours === 'string' 
        ? JSON.parse(restaurant.opening_hours) 
        : restaurant.opening_hours as Record<string, any>;
      
      Object.entries(hours).forEach(([day, schedule]: [string, any]) => {
        if (!schedule.closed && schedule.open && schedule.close) {
          if (schedule.open >= schedule.close) {
            issues.push({ 
              field: `opening_hours.${day}`, 
              message: `Opening time (${schedule.open}) must be before closing time (${schedule.close}) for ${day}`, 
              severity: 'error', 
              type: 'logic' 
            });
          }
        }
      });
    } catch (e) {
      issues.push({ field: 'opening_hours', message: 'Invalid operating hours format', severity: 'error', type: 'format' });
    }
  } else {
    issues.push({ field: 'opening_hours', message: 'Operating hours are not set', severity: 'warning', type: 'missing' });
  }

  const score = calculateScore(issues);
  return {
    isValid: !issues.some(i => i.severity === 'error'),
    issues,
    score
  };
};

/**
 * Validates a restaurant location
 */
export const validateLocationData = (location: RestaurantLocation): ValidationResult => {
  const issues: ValidationIssue[] = [];

  // Mandatory fields
  if (!location.address) {
    issues.push({ field: 'address', message: 'Address is required', severity: 'error', type: 'missing' });
  }

  // Phone validation
  if (location.phone_number) {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (!phoneRegex.test(location.phone_number)) {
      issues.push({ field: 'phone_number', message: 'Invalid phone number format', severity: 'warning', type: 'format' });
    }
  } else {
    issues.push({ field: 'phone_number', message: 'Contact phone is missing', severity: 'warning', type: 'missing' });
  }

  // Email validation
  if (location.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(location.email)) {
      issues.push({ field: 'email', message: 'Invalid email address format', severity: 'error', type: 'format' });
    }
  }

  // Geolocation consistency
  if (location.latitude && location.longitude) {
    // Basic range check
    if (location.latitude < -90 || location.latitude > 90 || location.longitude < -180 || location.longitude > 180) {
      issues.push({ field: 'coordinates', message: 'Latitude or longitude is out of range', severity: 'error', type: 'logic' });
    }
  } else {
    issues.push({ field: 'coordinates', message: 'Geolocation coordinates are missing', severity: 'warning', type: 'missing' });
  }

  const score = calculateScore(issues);
  return {
    isValid: !issues.some(i => i.severity === 'error'),
    issues,
    score
  };
};

/**
 * Validates menu items
 */
export const validateMenuData = (items: MenuItem[]): ValidationResult => {
  const issues: ValidationIssue[] = [];

  if (items.length === 0) {
    issues.push({ field: 'menu', message: 'No menu items found', severity: 'warning', type: 'missing' });
  }

  items.forEach((item, index) => {
    if (!item.name?.trim()) {
      issues.push({ field: `menu_items[${index}].name`, message: `Item ${index + 1} is missing a name`, severity: 'error', type: 'missing' });
    }
    if (item.price < 0) {
      issues.push({ field: `menu_items[${index}].price`, message: `Item "${item.name}" has a negative price`, severity: 'error', type: 'logic' });
    }
    if (!item.image_url) {
      issues.push({ field: `menu_items[${index}].image_url`, message: `Item "${item.name}" is missing a photo`, severity: 'warning', type: 'missing' });
    }
  });

  const score = calculateScore(issues);
  return {
    isValid: !issues.some(i => i.severity === 'error'),
    issues,
    score
  };
};

const calculateScore = (issues: ValidationIssue[]): number => {
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  
  // Start with 100, deduct 15 for each error, 5 for each warning
  const score = Math.max(0, 100 - (errorCount * 15) - (warningCount * 5));
  return score;
};
