import { ErrorHandler } from './error-handling';

export interface SecurityCheck {
  name: string;
  status: 'secure' | 'vulnerable' | 'warning';
  message: string;
  recommendation?: string;
}

export interface SecurityReport {
  checks: SecurityCheck[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

class SecurityHardening {
  private securityHeaders = [
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
  ];

  async performSecurityAudit(): Promise<SecurityReport> {
    const checks: SecurityCheck[] = [];

    try {
      checks.push(await this.checkHttps());
      checks.push(await this.checkSecurityHeaders());
      checks.push(await this.checkMixedContent());
      checks.push(await this.checkXSSVulnerabilities());
      checks.push(await this.checkLocalStorageSecurity());
      checks.push(await this.checkThirdPartyScripts());
      checks.push(await this.checkFormSecurity());
    } catch (error) {
      ErrorHandler.handle(error, { context: 'SecurityHardening.performSecurityAudit' });
    }

    return this.generateSecurityReport(checks);
  }

  private async checkHttps(): Promise<SecurityCheck> {
    const isHttps = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    if (isHttps || isLocalhost) {
      return {
        name: 'HTTPS Enforcement',
        status: 'secure',
        message: 'Site is served over HTTPS',
      };
    } else {
      return {
        name: 'HTTPS Enforcement',
        status: 'vulnerable',
        message: 'Site is not served over HTTPS',
        recommendation: 'Enable HTTPS to protect user data in transit',
      };
    }
  }

  private async checkSecurityHeaders(): Promise<SecurityCheck> {
    const missingHeaders: string[] = [];
    
    // Check for security headers (this is simplified - in production you'd check actual response headers)
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      missingHeaders.push('Content-Security-Policy');
    }

    const frameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    if (!frameOptions) {
      missingHeaders.push('X-Frame-Options');
    }

    if (missingHeaders.length === 0) {
      return {
        name: 'Security Headers',
        status: 'secure',
        message: 'Essential security headers are present',
      };
    } else if (missingHeaders.length <= 2) {
      return {
        name: 'Security Headers',
        status: 'warning',
        message: `Missing headers: ${missingHeaders.join(', ')}`,
        recommendation: 'Implement missing security headers to improve protection',
      };
    } else {
      return {
        name: 'Security Headers',
        status: 'vulnerable',
        message: `Multiple security headers missing: ${missingHeaders.join(', ')}`,
        recommendation: 'Implement comprehensive security headers',
      };
    }
  }

  private async checkMixedContent(): Promise<SecurityCheck> {
    const httpResources = performance.getEntriesByType('resource')
      .filter(resource => resource.name.startsWith('http:') && !resource.name.includes('localhost'));

    if (httpResources.length === 0) {
      return {
        name: 'Mixed Content',
        status: 'secure',
        message: 'No mixed content detected',
      };
    } else {
      return {
        name: 'Mixed Content',
        status: 'vulnerable',
        message: `${httpResources.length} resources loaded over HTTP`,
        recommendation: 'Ensure all resources are loaded over HTTPS',
      };
    }
  }

  private async checkXSSVulnerabilities(): Promise<SecurityCheck> {
    const vulnerabilities: string[] = [];

    // Check for innerHTML usage (simplified check)
    const scripts = document.querySelectorAll('script:not([src])');
    let hasInnerHTML = false;
    
    scripts.forEach(script => {
      if (script.textContent?.includes('innerHTML') || script.textContent?.includes('document.write')) {
        hasInnerHTML = true;
      }
    });

    if (hasInnerHTML) {
      vulnerabilities.push('Potential innerHTML usage detected');
    }

    // Check for eval usage
    if (window.eval.toString() !== 'function eval() { [native code] }') {
      vulnerabilities.push('eval function may have been overridden');
    }

    if (vulnerabilities.length === 0) {
      return {
        name: 'XSS Protection',
        status: 'secure',
        message: 'No obvious XSS vulnerabilities detected',
      };
    } else {
      return {
        name: 'XSS Protection',
        status: 'warning',
        message: `Potential issues: ${vulnerabilities.join(', ')}`,
        recommendation: 'Review code for XSS vulnerabilities and use safe DOM manipulation',
      };
    }
  }

  private async checkLocalStorageSecurity(): Promise<SecurityCheck> {
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /api[_-]?key/i,
      /auth/i,
    ];

    const sensitiveData: string[] = [];

    try {
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          const isSensitive = sensitivePatterns.some(pattern => 
            pattern.test(key) || pattern.test(localStorage[key] || '')
          );
          
          if (isSensitive) {
            sensitiveData.push(key);
          }
        }
      }
    } catch (error) {
      // localStorage access might be restricted
    }

    if (sensitiveData.length === 0) {
      return {
        name: 'Local Storage Security',
        status: 'secure',
        message: 'No sensitive data detected in localStorage',
      };
    } else {
      return {
        name: 'Local Storage Security',
        status: 'warning',
        message: `Potentially sensitive data in localStorage: ${sensitiveData.join(', ')}`,
        recommendation: 'Avoid storing sensitive data in localStorage, use secure httpOnly cookies instead',
      };
    }
  }

  private async checkThirdPartyScripts(): Promise<SecurityCheck> {
    const externalScripts = Array.from(document.querySelectorAll('script[src]'))
      .map(script => (script as HTMLScriptElement).src)
      .filter(src => !src.includes(location.hostname) && !src.startsWith('/'))
      .filter(src => !src.includes('localhost'));

    const hasIntegrity = Array.from(document.querySelectorAll('script[src][integrity]')).length;
    const externalCount = externalScripts.length;

    if (externalCount === 0) {
      return {
        name: 'Third-party Scripts',
        status: 'secure',
        message: 'No third-party scripts detected',
      };
    } else if (hasIntegrity === externalCount) {
      return {
        name: 'Third-party Scripts',
        status: 'secure',
        message: `All ${externalCount} third-party scripts have integrity checks`,
      };
    } else {
      return {
        name: 'Third-party Scripts',
        status: 'warning',
        message: `${externalCount - hasIntegrity} of ${externalCount} scripts lack integrity checks`,
        recommendation: 'Add integrity attributes to third-party scripts',
      };
    }
  }

  private async checkFormSecurity(): Promise<SecurityCheck> {
    const forms = document.querySelectorAll('form');
    const issues: string[] = [];

    forms.forEach((form, index) => {
      // Check for CSRF protection (simplified)
      const csrfToken = form.querySelector('input[name*="csrf"], input[name*="token"]');
      if (!csrfToken && form.method?.toLowerCase() === 'post') {
        issues.push(`Form ${index + 1} missing CSRF protection`);
      }

      // Check for autocomplete on sensitive fields
      const passwordFields = form.querySelectorAll('input[type="password"]:not([autocomplete="off"])');
      if (passwordFields.length > 0) {
        issues.push(`Form ${index + 1} has password fields with autocomplete enabled`);
      }
    });

    if (issues.length === 0) {
      return {
        name: 'Form Security',
        status: 'secure',
        message: 'Forms appear to have adequate security measures',
      };
    } else {
      return {
        name: 'Form Security',
        status: 'warning',
        message: `Security issues found: ${issues.join(', ')}`,
        recommendation: 'Implement CSRF protection and review autocomplete settings',
      };
    }
  }

  private generateSecurityReport(checks: SecurityCheck[]): SecurityReport {
    const criticalCount = 0; // No critical status in current type
    const vulnerableCount = checks.filter(c => c.status === 'vulnerable').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;

    let riskLevel: 'low' | 'medium' | 'high' | 'critical';

    if (criticalCount > 0) {
      riskLevel = 'critical';
    } else if (vulnerableCount > 2) {
      riskLevel = 'high';
    } else if (vulnerableCount > 0 || warningCount > 3) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    return {
      checks,
      riskLevel,
      timestamp: Date.now(),
    };
  }

  // Security utilities
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  hashSensitiveData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    return crypto.subtle.digest('SHA-256', dataBuffer)
      .then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
      });
  }

  auditApplication() {
    const securityReport = this.performSecurityAudit();
    
    return securityReport.then(report => ({
      overall: {
        passed: report.riskLevel === 'low',
        issues: report.checks.filter(c => c.status !== 'secure').map(c => c.message),
        recommendations: report.checks.filter(c => c.recommendation).map(c => c.recommendation!)
      },
      details: {
        riskLevel: report.riskLevel,
        checks: report.checks,
        timestamp: report.timestamp
      }
    }));
  }
}

export const securityHardening = new SecurityHardening();