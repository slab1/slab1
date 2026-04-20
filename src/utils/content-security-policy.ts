/**
 * Content Security Policy utilities for preventing XSS attacks
 */

export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    "https://cdn.jsdelivr.net",
    "https://unpkg.com"
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for styled components
    "https://fonts.googleapis.com"
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  imgSrc: [
    "'self'",
    "data:",
    "https:",
    "blob:"
  ],
  connectSrc: [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co"
  ],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"]
};

export function generateCSPHeader(): string {
  const directives = Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey} ${values.join(' ')}`;
    })
    .join('; ');
  
  return directives;
}

export function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - removes script tags and event handlers
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

export function validateImageURL(url: string): boolean {
  try {
    const parsedURL = new URL(url);
    
    // Only allow HTTPS for external images
    if (parsedURL.protocol !== 'https:' && parsedURL.protocol !== 'data:') {
      return false;
    }
    
    // Check for common image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = validExtensions.some(ext => 
      parsedURL.pathname.toLowerCase().endsWith(ext)
    );
    
    // Allow data URLs for base64 images
    if (parsedURL.protocol === 'data:') {
      return url.startsWith('data:image/');
    }
    
    return hasValidExtension;
  } catch {
    return false;
  }
}

export function preventXSS(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}