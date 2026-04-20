
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { format, parse, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string or object consistently
 */
export function formatDisplayDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return 'Invalid Date';
  return format(d, 'EEEE, MMM d, yyyy');
}

/**
 * Format a time string (HH:mm) for display
 */
export function formatDisplayTime(time: string): string {
  if (!time) return '';
  try {
    // Check if it's already in a readable format or needs parsing
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return format(date, 'h:mm a');
    }
    return time;
  } catch (e) {
    return time;
  }
}

/**
 * Combine date and time into a single Date object
 */
export function combineDateTime(date: string | Date, time: string): Date {
  const baseDate = typeof date === 'string' ? new Date(date) : date;
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(baseDate);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert hex color to HSL format
 * @param hex - The hex color code (e.g., "#ff0000")
 * @returns HSL string (e.g., "0 100% 50%")
 */
export function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
