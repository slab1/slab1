import { RateLimiter, securityUtils } from './validation';
import { errorTracker } from './error-tracking';

export interface SecurityConfig {
  enableRateLimit: boolean;
  enableInputSanitization: boolean;
  enableCSRFProtection: boolean;
  enableRequestLogging: boolean;
  maxRequestsPerMinute: number;
  trustedOrigins: string[];
}

const defaultConfig: SecurityConfig = {
  enableRateLimit: true,
  enableInputSanitization: true,
  enableCSRFProtection: true,
  enableRequestLogging: true,
  maxRequestsPerMinute: 60,
  trustedOrigins: ['localhost', 'https://your-domain.com'],
};

export class SecurityMiddleware {
  private rateLimiter: RateLimiter;
  private config: SecurityConfig;
  private csrfTokens = new Set<string>();

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.rateLimiter = new RateLimiter(this.config.maxRequestsPerMinute);
  }

  // Main middleware function
  async processRequest(
    url: string,
    options: RequestInit = {},
    userIdentifier?: string
  ): Promise<RequestInit> {
    const identifier = userIdentifier || this.getClientIdentifier();

    // Rate limiting
    if (this.config.enableRateLimit) {
      this.enforceRateLimit(identifier, url);
    }

    // CSRF protection for state-changing operations
    if (this.config.enableCSRFProtection) {
      options = this.addCSRFProtection(options);
    }

    // Input sanitization
    if (this.config.enableInputSanitization && options.body) {
      options.body = this.sanitizeRequestBody(options.body);
    }

    // Request logging
    if (this.config.enableRequestLogging) {
      this.logRequest(url, options, identifier);
    }

    // Add security headers
    options.headers = this.addSecurityHeaders(options.headers);

    return options;
  }

  // Process response for security analysis
  async processResponse(response: Response, url: string): Promise<Response> {
    // Log suspicious response patterns
    if (response.status >= 400) {
      errorTracker.captureApiError(
        url,
        'GET', // Default method, would need to be passed in real implementation
        response.status,
        await response.clone().text()
      );
    }

    // Check for potential security issues in response headers
    this.analyzeResponseHeaders(response.headers, url);

    return response;
  }

  // Generate and store CSRF token
  generateCSRFToken(): string {
    const token = securityUtils.generateCSRFToken();
    this.csrfTokens.add(token);
    
    // Clean up old tokens periodically
    if (this.csrfTokens.size > 100) {
      const tokensArray = Array.from(this.csrfTokens);
      this.csrfTokens.clear();
      // Keep only the last 50 tokens
      tokensArray.slice(-50).forEach(t => this.csrfTokens.add(t));
    }
    
    return token;
  }

  // Validate CSRF token
  validateCSRFToken(token: string): boolean {
    return this.csrfTokens.has(token);
  }

  // Get security report
  getSecurityReport(): {
    rateLimitStatus: { identifier: string; remaining: number }[];
    activeCSRFTokens: number;
    config: SecurityConfig;
  } {
    // This would need access to rate limiter internals in a real implementation
    return {
      rateLimitStatus: [], // Placeholder
      activeCSRFTokens: this.csrfTokens.size,
      config: this.config,
    };
  }

  private enforceRateLimit(identifier: string, url: string): void {
    if (!this.rateLimiter.isAllowed(identifier)) {
      const remaining = this.rateLimiter.getRemainingRequests(identifier);
      errorTracker.captureError(
        `Rate limit exceeded for ${identifier} on ${url}`,
        'warning',
        { identifier, url, remaining, type: 'rate_limit' }
      );
      
      throw new Error(`Rate limit exceeded. Try again later.`);
    }
  }

  private addCSRFProtection(options: RequestInit): RequestInit {
    const method = options.method?.toUpperCase();
    
    // Add CSRF protection for state-changing operations
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const token = this.generateCSRFToken();
      
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-CSRF-Token': token,
        },
      };
    }
    
    return options;
  }

  private sanitizeRequestBody(body: BodyInit): BodyInit {
    if (typeof body === 'string') {
      try {
        const data = JSON.parse(body);
        const sanitized = this.sanitizeObject(data);
        return JSON.stringify(sanitized);
      } catch {
        // If not JSON, just return the original body
        return body;
      }
    }
    
    return body;
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return securityUtils.escapeHtml(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  private addSecurityHeaders(headers: HeadersInit = {}): HeadersInit {
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };

    return {
      ...headers,
      ...securityHeaders,
    };
  }

  private logRequest(url: string, options: RequestInit, identifier: string): void {
    const logData = {
      url,
      method: options.method || 'GET',
      identifier,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      origin: typeof window !== 'undefined' ? window.location.origin : 'Unknown',
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Security Log:', logData);
    }

    // In production, this would be sent to a logging service
    // logToExternalService(logData);
  }

  private analyzeResponseHeaders(headers: Headers, url: string): void {
    const securityIssues: string[] = [];

    // Check for missing security headers
    if (!headers.get('Content-Security-Policy')) {
      securityIssues.push('Missing Content-Security-Policy header');
    }

    if (!headers.get('Strict-Transport-Security')) {
      securityIssues.push('Missing Strict-Transport-Security header');
    }

    // Check for sensitive data exposure
    const contentType = headers.get('Content-Type');
    if (contentType?.includes('application/json')) {
      // Could add checks for sensitive data patterns in JSON responses
    }

    if (securityIssues.length > 0) {
      errorTracker.captureError(
        `Security issues detected for ${url}`,
        'warning',
        { issues: securityIssues, url, type: 'security_analysis' }
      );
    }
  }

  private getClientIdentifier(): string {
    // Generate a client identifier based on various factors
    const factors = [
      typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      typeof window !== 'undefined' && window.screen ? window.screen.width : 0,
      typeof window !== 'undefined' && window.screen ? window.screen.height : 0,
      typeof navigator !== 'undefined' ? navigator.language : 'en-US',
      typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    ];

    // Create a simple hash
    let hash = 0;
    const str = factors.join('|');
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(36);
  }
}

// Create singleton instance
export const securityMiddleware = new SecurityMiddleware();

// Enhanced fetch wrapper with security
export async function secureFetch(
  url: string,
  options: RequestInit = {},
  userIdentifier?: string
): Promise<Response> {
  try {
    // Process request through security middleware
    const secureOptions = await securityMiddleware.processRequest(
      url,
      options,
      userIdentifier
    );

    // Make the request
    const response = await fetch(url, secureOptions);

    // Process response through security middleware
    return await securityMiddleware.processResponse(response, url);
  } catch (error) {
    errorTracker.captureError(
      error instanceof Error ? error : new Error(String(error)),
      'error',
      { url, method: options.method, type: 'secure_fetch' }
    );
    throw error;
  }
}

// Hook for React components to use secure fetch
export function useSecureFetch() {
  return {
    secureFetch,
    generateCSRFToken: () => securityMiddleware.generateCSRFToken(),
    getSecurityReport: () => securityMiddleware.getSecurityReport(),
  };
}
