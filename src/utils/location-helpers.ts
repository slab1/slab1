import { RestaurantLocation, RestaurantLocationAddress } from '@/api/types';

/**
 * Helper to get display address string from location
 * Handles both string and JSONB address formats
 */
export function getDisplayAddress(location: RestaurantLocation | null | undefined): string {
  if (!location) return '';
  
  const address = location.address;
  
  if (typeof address === 'string') {
    return address;
  }
  
  if (typeof address === 'object' && address && !Array.isArray(address)) {
    const addr = address as RestaurantLocationAddress;
    const parts = [addr.street, addr.city, addr.state, addr.zip].filter(Boolean);
    return parts.join(', ');
  }
  
  return '';
}

/**
 * Helper to get city from location
 * Handles both string and JSONB address formats
 */
export function getLocationCity(location: RestaurantLocation | null | undefined): string {
  if (!location) return '';
  
  const address = location.address;
  
  if (typeof address === 'object' && address && !Array.isArray(address)) {
    return (address as RestaurantLocationAddress).city || '';
  }
  
  // Fallback to city property if address is a string
  return (location as any).city || '';
}

/**
 * Helper to get state from location
 * Handles both string and JSONB address formats
 */
export function getLocationState(location: RestaurantLocation | null | undefined): string {
  if (!location) return '';
  
  const address = location.address;
  
  if (typeof address === 'object' && address && !Array.isArray(address)) {
    return (address as RestaurantLocationAddress).state || '';
  }
  
  // Fallback to state property if address is a string
  return (location as any).state || '';
}

/**
 * Helper to get city and state formatted string
 */
export function getLocationCityState(location: RestaurantLocation | null | undefined): string {
  const city = getLocationCity(location);
  const state = getLocationState(location);
  
  if (city && state) {
    return `${city}, ${state}`;
  }
  
  return city || state || 'Location';
}

/**
 * Helper to get street address from location
 */
export function getStreetAddress(location: RestaurantLocation | null | undefined): string {
  if (!location) return '';
  
  const address = location.address;
  
  if (typeof address === 'string') {
    return address;
  }
  
  if (typeof address === 'object' && address && !Array.isArray(address)) {
    return (address as RestaurantLocationAddress).street || '';
  }
  
  return '';
}

/**
 * Parse coordinates from POINT type string or object
 */
export function parseCoordinates(coordinates: string | { latitude?: number; longitude?: number } | null | undefined): { latitude: number; longitude: number } | null {
  if (!coordinates) return null;
  
  if (typeof coordinates === 'object') {
    if (coordinates.latitude && coordinates.longitude) {
      return { latitude: coordinates.latitude, longitude: coordinates.longitude };
    }
    return null;
  }
  
  // Parse POINT type format: "(lon,lat)"
  const match = String(coordinates).match(/\(([^,]+),([^)]+)\)/);
  if (match) {
    const lon = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lon)) {
      return { latitude: lat, longitude: lon };
    }
  }
  
  return null;
}
