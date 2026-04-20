
import { Restaurant, RestaurantLocation, MenuItem } from '@/api/types';
import { 
  validateRestaurantData, 
  validateLocationData, 
  validateMenuData,
  ValidationResult 
} from './restaurantValidation';

export interface ComprehensiveValidation {
  restaurantId: string;
  restaurantName: string;
  core: ValidationResult;
  locations: ValidationResult[];
  menu: ValidationResult;
  overallScore: number;
  lastChecked: string;
}

/**
 * Performs a comprehensive validation scan for a restaurant
 */
export const performFullValidation = (
  restaurant: Restaurant,
  locations: RestaurantLocation[] = [],
  menuItems: MenuItem[] = []
): ComprehensiveValidation => {
  const core = validateRestaurantData(restaurant);
  const locationResults = locations.map(l => validateLocationData(l));
  const menu = validateMenuData(menuItems);

  const overallScore = Math.round(
    (core.score + 
     (locationResults.reduce((acc, curr) => acc + curr.score, 0) / Math.max(1, locationResults.length)) + 
     menu.score) / 3
  );

  return {
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    core,
    locations: locationResults,
    menu,
    overallScore,
    lastChecked: new Date().toISOString()
  };
};

/**
 * Identifies potential duplicate restaurants
 */
export const findPotentialDuplicates = (restaurants: Restaurant[]): Array<{a: Restaurant, b: Restaurant, reason: string}> => {
  const duplicates: Array<{a: Restaurant, b: Restaurant, reason: string}> = [];
  
  for (let i = 0; i < restaurants.length; i++) {
    for (let j = i + 1; j < restaurants.length; j++) {
      const a = restaurants[i];
      const b = restaurants[j];
      
      // Check for exact name match
      if (a.name.toLowerCase().trim() === b.name.toLowerCase().trim()) {
        duplicates.push({ a, b, reason: 'Exact name match' });
        continue;
      }
      
      // Check for similar name and same cuisine
      if (a.cuisine === b.cuisine && isSimilar(a.name, b.name)) {
        duplicates.push({ a, b, reason: 'Similar name and same cuisine' });
      }
    }
  }
  
  return duplicates;
};

const isSimilar = (s1: string, s2: string): boolean => {
  const n1 = s1.toLowerCase().trim();
  const n2 = s2.toLowerCase().trim();
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  // Simple Levenshtein-like check for small differences
  let diff = 0;
  for (let i = 0; i < Math.min(n1.length, n2.length); i++) {
    if (n1[i] !== n2[i]) diff++;
  }
  diff += Math.abs(n1.length - n2.length);
  
  return diff <= 2;
};
