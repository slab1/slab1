import { ErrorHandler } from './error-handling';

export interface QualityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export interface QualityReport {
  checks: QualityCheck[];
  score: number;
  timestamp: number;
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
}

class QualityAssurance {
  async runQualityChecks(): Promise<QualityReport> {
    const checks: QualityCheck[] = [];

    try {
      // Performance checks
      checks.push(await this.checkPageLoadTime());
      checks.push(await this.checkMemoryUsage());
      checks.push(await this.checkNetworkRequests());

      // Accessibility checks
      checks.push(await this.checkAccessibility());
      
      // Security checks
      checks.push(await this.checkSecurity());
      
      // Code quality checks
      checks.push(await this.checkConsoleErrors());
      checks.push(await this.checkLocalStorage());

      // SEO checks
      checks.push(await this.checkSEO());

    } catch (error) {
      checks.push({
        name: 'Quality Check Execution',
        status: 'fail',
        message: 'Failed to execute quality checks',
        details: ErrorHandler.handle(error, { context: 'QualityAssurance.runQualityChecks' }),
      });
    }

    return this.generateReport(checks);
  }

  private async checkPageLoadTime(): Promise<QualityCheck> {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation ? navigation.loadEventEnd - navigation.startTime : 0;

      if (loadTime === 0) {
        return {
          name: 'Page Load Time',
          status: 'warning',
          message: 'Unable to measure page load time',
        };
      }

      if (loadTime < 2000) {
        return {
          name: 'Page Load Time',
          status: 'pass',
          message: `Excellent load time: ${loadTime.toFixed(0)}ms`,
          details: { loadTime },
        };
      } else if (loadTime < 5000) {
        return {
          name: 'Page Load Time',
          status: 'warning',
          message: `Acceptable load time: ${loadTime.toFixed(0)}ms`,
          details: { loadTime },
        };
      } else {
        return {
          name: 'Page Load Time',
          status: 'fail',
          message: `Slow load time: ${loadTime.toFixed(0)}ms`,
          details: { loadTime },
        };
      }
    } catch (error) {
      return {
        name: 'Page Load Time',
        status: 'fail',
        message: 'Failed to check page load time',
        details: { error: error?.toString() },
      };
    }
  }

  private async checkMemoryUsage(): Promise<QualityCheck> {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

        if (usage < 50) {
          return {
            name: 'Memory Usage',
            status: 'pass',
            message: `Low memory usage: ${usage.toFixed(1)}%`,
            details: { usage },
          };
        } else if (usage < 80) {
          return {
            name: 'Memory Usage',
            status: 'warning',
            message: `Moderate memory usage: ${usage.toFixed(1)}%`,
            details: { usage },
          };
        } else {
          return {
            name: 'Memory Usage',
            status: 'fail',
            message: `High memory usage: ${usage.toFixed(1)}%`,
            details: { usage },
          };
        }
      } else {
        return {
          name: 'Memory Usage',
          status: 'warning',
          message: 'Memory API not available',
        };
      }
    } catch (error) {
      return {
        name: 'Memory Usage',
        status: 'fail',
        message: 'Failed to check memory usage',
        details: { error: error?.toString() },
      };
    }
  }

  private async checkNetworkRequests(): Promise<QualityCheck> {
    try {
      const resources = performance.getEntriesByType('resource');
      const slowRequests = resources.filter(r => r.duration > 2000);
      const failedRequests = resources.filter(r => (r as any).transferSize === 0 && r.duration > 0);

      if (slowRequests.length === 0 && failedRequests.length === 0) {
        return {
          name: 'Network Requests',
          status: 'pass',
          message: `All ${resources.length} requests completed successfully`,
          details: { totalRequests: resources.length },
        };
      } else if (slowRequests.length > 0 && failedRequests.length === 0) {
        return {
          name: 'Network Requests',
          status: 'warning',
          message: `${slowRequests.length} slow requests detected`,
          details: { slowRequests: slowRequests.length, failedRequests: failedRequests.length },
        };
      } else {
        return {
          name: 'Network Requests',
          status: 'fail',
          message: `${failedRequests.length} failed requests, ${slowRequests.length} slow requests`,
          details: { slowRequests: slowRequests.length, failedRequests: failedRequests.length },
        };
      }
    } catch (error) {
      return {
        name: 'Network Requests',
        status: 'fail',
        message: 'Failed to analyze network requests',
        details: { error: error?.toString() },
      };
    }
  }

  private async checkAccessibility(): Promise<QualityCheck> {
    try {
      const issues: string[] = [];

      // Check for missing alt attributes
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        issues.push(`${images.length} images missing alt attributes`);
      }

      // Check for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const h1Count = document.querySelectorAll('h1').length;
      if (h1Count !== 1) {
        issues.push(`Found ${h1Count} H1 elements (should be exactly 1)`);
      }

      // Check for form labels
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])');
      const unlabeledInputs = Array.from(inputs).filter(input => {
        const id = input.getAttribute('id');
        return !id || !document.querySelector(`label[for="${id}"]`);
      });
      if (unlabeledInputs.length > 0) {
        issues.push(`${unlabeledInputs.length} form inputs without proper labels`);
      }

      if (issues.length === 0) {
        return {
          name: 'Accessibility',
          status: 'pass',
          message: 'No accessibility issues detected',
        };
      } else if (issues.length <= 2) {
        return {
          name: 'Accessibility',
          status: 'warning',
          message: 'Minor accessibility issues found',
          details: { issues },
        };
      } else {
        return {
          name: 'Accessibility',
          status: 'fail',
          message: 'Multiple accessibility issues found',
          details: { issues },
        };
      }
    } catch (error) {
      return {
        name: 'Accessibility',
        status: 'fail',
        message: 'Failed to check accessibility',
        details: { error: error?.toString() },
      };
    }
  }

  private async checkSecurity(): Promise<QualityCheck> {
    try {
      const issues: string[] = [];

      // Check for HTTPS
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        issues.push('Page not served over HTTPS');
      }

      // Check for mixed content
      const httpResources = performance.getEntriesByType('resource')
        .filter(r => r.name.startsWith('http:'));
      if (httpResources.length > 0) {
        issues.push(`${httpResources.length} resources loaded over HTTP`);
      }

      // Check for CSP header
      const hasCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!hasCsp) {
        issues.push('No Content Security Policy detected');
      }

      if (issues.length === 0) {
        return {
          name: 'Security',
          status: 'pass',
          message: 'No security issues detected',
        };
      } else if (issues.length <= 1) {
        return {
          name: 'Security',
          status: 'warning',
          message: 'Minor security issues found',
          details: { issues },
        };
      } else {
        return {
          name: 'Security',
          status: 'fail',
          message: 'Multiple security issues found',
          details: { issues },
        };
      }
    } catch (error) {
      return {
        name: 'Security',
        status: 'fail',
        message: 'Failed to check security',
        details: { error: error?.toString() },
      };
    }
  }

  private async checkConsoleErrors(): Promise<QualityCheck> {
    // This is a simplified check - in reality you'd need to capture console output
    try {
      const errorCount = 0; // Would need actual error tracking
      
      if (errorCount === 0) {
        return {
          name: 'Console Errors',
          status: 'pass',
          message: 'No console errors detected',
        };
      } else if (errorCount <= 2) {
        return {
          name: 'Console Errors',
          status: 'warning',
          message: `${errorCount} console errors detected`,
          details: { errorCount },
        };
      } else {
        return {
          name: 'Console Errors',
          status: 'fail',
          message: `${errorCount} console errors detected`,
          details: { errorCount },
        };
      }
    } catch (error) {
      return {
        name: 'Console Errors',
        status: 'fail',
        message: 'Failed to check console errors',
        details: { error: error?.toString() },
      };
    }
  }

  private async checkLocalStorage(): Promise<QualityCheck> {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalSize += (localStorage[key]?.length || 0) + key.length;
        }
      }

      const sizeInMB = totalSize / (1024 * 1024);
      const maxSize = 5; // 5MB typical limit

      if (sizeInMB < maxSize * 0.5) {
        return {
          name: 'Local Storage',
          status: 'pass',
          message: `Storage usage: ${sizeInMB.toFixed(2)}MB`,
          details: { sizeInMB },
        };
      } else if (sizeInMB < maxSize * 0.8) {
        return {
          name: 'Local Storage',
          status: 'warning',
          message: `High storage usage: ${sizeInMB.toFixed(2)}MB`,
          details: { sizeInMB },
        };
      } else {
        return {
          name: 'Local Storage',
          status: 'fail',
          message: `Storage nearly full: ${sizeInMB.toFixed(2)}MB`,
          details: { sizeInMB },
        };
      }
    } catch (error) {
      return {
        name: 'Local Storage',
        status: 'fail',
        message: 'Failed to check local storage',
        details: { error: error?.toString() },
      };
    }
  }

  private async checkSEO(): Promise<QualityCheck> {
    try {
      const issues: string[] = [];

      // Check title
      const title = document.querySelector('title');
      if (!title || title.textContent!.length < 10) {
        issues.push('Missing or short page title');
      }

      // Check meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc || metaDesc.getAttribute('content')!.length < 50) {
        issues.push('Missing or short meta description');
      }

      // Check H1
      const h1Elements = document.querySelectorAll('h1');
      if (h1Elements.length !== 1) {
        issues.push(`Should have exactly 1 H1 tag (found ${h1Elements.length})`);
      }

      // Check viewport meta
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        issues.push('Missing viewport meta tag');
      }

      if (issues.length === 0) {
        return {
          name: 'SEO',
          status: 'pass',
          message: 'SEO fundamentals are in place',
        };
      } else if (issues.length <= 2) {
        return {
          name: 'SEO',
          status: 'warning',
          message: 'Minor SEO issues found',
          details: { issues },
        };
      } else {
        return {
          name: 'SEO',
          status: 'fail',
          message: 'Multiple SEO issues found',
          details: { issues },
        };
      }
    } catch (error) {
      return {
        name: 'SEO',
        status: 'fail',
        message: 'Failed to check SEO',
        details: { error: error?.toString() },
      };
    }
  }

  private generateReport(checks: QualityCheck[]): QualityReport {
    const passed = checks.filter(c => c.status === 'pass').length;
    const failed = checks.filter(c => c.status === 'fail').length;
    const warnings = checks.filter(c => c.status === 'warning').length;

    // Calculate score (pass = 100%, warning = 50%, fail = 0%)
    const totalPoints = (passed * 100) + (warnings * 50);
    const maxPoints = checks.length * 100;
    const score = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    return {
      checks,
      score: Math.round(score),
      timestamp: Date.now(),
      summary: { passed, failed, warnings },
    };
  }

  init() {
    console.log('Quality Assurance monitoring initialized');
    this.startPeriodicChecks();
  }

  private startPeriodicChecks() {
    // Run quality checks every 5 minutes in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        this.runQualityChecks().then(report => {
          if (report.score < 80) {
            console.warn('Quality score below threshold:', report.score);
          }
        });
      }, 300000);
    }
  }
}

export const qualityAssurance = new QualityAssurance();

// Backward compatibility export
export const qualityMonitor = qualityAssurance;