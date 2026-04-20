
// Production optimizations and deployment utilities
import { performanceMonitor, memoryMonitor, bundleAnalyzer } from './performance-monitoring';
import { securityHardening } from './security-hardening';
import { qualityAssurance } from './quality-assurance';
import { errorTracker } from './error-tracking';

export interface DeploymentChecklist {
  performance: boolean;
  security: boolean;
  accessibility: boolean;
  seo: boolean;
  errors: boolean;
  dependencies: boolean;
}

export interface OptimizationReport {
  passed: boolean;
  checklist: DeploymentChecklist;
  issues: string[];
  recommendations: string[];
  metrics: {
    performance: any;
    security: any;
    bundle: any;
  };
}

class ProductionOptimizer {
  // Pre-deployment checks
  async runDeploymentChecks(): Promise<OptimizationReport> {
    console.log('Running production deployment checks...');

    const performanceCheck = await this.checkPerformance();
    const securityCheck = await this.checkSecurity();
    const accessibilityCheck = await this.checkAccessibility();
    const seoCheck = await this.checkSEO();
    const errorCheck = await this.checkErrors();
    const dependencyCheck = await this.checkDependencies();

    const checklist: DeploymentChecklist = {
      performance: performanceCheck.passed,
      security: securityCheck.passed,
      accessibility: accessibilityCheck.passed,
      seo: seoCheck.passed,
      errors: errorCheck.passed,
      dependencies: dependencyCheck.passed,
    };

    const allIssues = [
      ...performanceCheck.issues,
      ...securityCheck.issues,
      ...accessibilityCheck.issues,
      ...seoCheck.issues,
      ...errorCheck.issues,
      ...dependencyCheck.issues,
    ];

    const allRecommendations = [
      ...performanceCheck.recommendations,
      ...securityCheck.recommendations,
      ...accessibilityCheck.recommendations,
      ...seoCheck.recommendations,
      ...errorCheck.recommendations,
      ...dependencyCheck.recommendations,
    ];

    return {
      passed: Object.values(checklist).every(Boolean),
      checklist,
      issues: allIssues,
      recommendations: allRecommendations,
      metrics: {
        performance: performanceMonitor.getWebVitals(),
        security: securityCheck.details,
        bundle: bundleAnalyzer.analyzeBundleSize(),
      },
    };
  }

  private async checkPerformance(): Promise<{ passed: boolean; issues: string[]; recommendations: string[] }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const vitals = performanceMonitor.getWebVitals();
    
    if (vitals.lcp && vitals.lcp > 2500) {
      issues.push(`LCP is ${vitals.lcp}ms (should be < 2500ms)`);
      recommendations.push('Optimize images and reduce server response time');
    }

    if (vitals.fid && vitals.fid > 100) {
      issues.push(`FID is ${vitals.fid}ms (should be < 100ms)`);
      recommendations.push('Reduce JavaScript execution time');
    }

    if (vitals.cls && vitals.cls > 0.1) {
      issues.push(`CLS is ${vitals.cls} (should be < 0.1)`);
      recommendations.push('Reserve space for images and ads');
    }

    const bundleHealth = bundleAnalyzer.checkBundleHealth();
    if (!bundleHealth.healthy) {
      issues.push(...bundleHealth.issues);
      recommendations.push('Optimize bundle size with code splitting');
    }

    const memoryUsage = memoryMonitor.getMemoryUsage();
    if (memoryUsage && memoryUsage.usedJSHeapSize > 50 * 1024 * 1024) {
      issues.push('High memory usage detected');
      recommendations.push('Check for memory leaks and optimize components');
    }

    return { passed: issues.length === 0, issues, recommendations };
  }

  private async checkSecurity(): Promise<{ 
    passed: boolean; 
    issues: string[]; 
    recommendations: string[];
    details: any;
  }> {
    const securityAudit = await securityHardening.auditApplication();
    
    return {
      passed: securityAudit.overall.passed,
      issues: securityAudit.overall.issues,
      recommendations: securityAudit.overall.recommendations,
      details: securityAudit.details,
    };
  }

  private async checkAccessibility(): Promise<{ passed: boolean; issues: string[]; recommendations: string[] }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for missing alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images missing alt text`);
      recommendations.push('Add descriptive alt text to all images');
    }

    // Check for missing form labels
    const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    if (inputsWithoutLabels.length > 0) {
      issues.push(`${inputsWithoutLabels.length} form inputs missing labels`);
      recommendations.push('Add proper labels to all form inputs');
    }

    // Check color contrast (simplified)
    const lowContrastElements = this.checkColorContrast();
    if (lowContrastElements.length > 0) {
      issues.push(`${lowContrastElements.length} elements may have low color contrast`);
      recommendations.push('Ensure adequate color contrast for readability');
    }

    // Check keyboard navigation
    const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
    const elementsWithoutTabIndex = Array.from(focusableElements).filter(el => 
      !el.hasAttribute('tabindex') && 
      getComputedStyle(el).display !== 'none'
    );

    if (elementsWithoutTabIndex.length > focusableElements.length * 0.1) {
      recommendations.push('Ensure proper keyboard navigation with tabindex');
    }

    return { passed: issues.length === 0, issues, recommendations };
  }

  private async checkSEO(): Promise<{ passed: boolean; issues: string[]; recommendations: string[] }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check meta tags
    const title = document.querySelector('title');
    if (!title || title.textContent!.length < 30) {
      issues.push('Page title is missing or too short');
      recommendations.push('Add descriptive page titles (30-60 characters)');
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      issues.push('Meta description is missing');
      recommendations.push('Add meta descriptions (150-160 characters)');
    }

    // Check heading structure
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length === 0) {
      issues.push('No H1 heading found');
      recommendations.push('Add a single H1 heading per page');
    } else if (h1Elements.length > 1) {
      issues.push('Multiple H1 headings found');
      recommendations.push('Use only one H1 heading per page');
    }

    // Check for Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogTitle || !ogDescription) {
      recommendations.push('Add Open Graph meta tags for social sharing');
    }

    // Check for robots.txt (would need server check)
    recommendations.push('Ensure robots.txt is properly configured');

    return { passed: issues.length === 0, issues, recommendations };
  }

  private async checkErrors(): Promise<{ passed: boolean; issues: string[]; recommendations: string[] }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const errorStats = errorTracker.getErrorStats();
    
    if (errorStats.totalErrors > 0) {
      issues.push(`${errorStats.totalErrors} JavaScript errors detected`);
      recommendations.push('Fix all JavaScript errors before deployment');
    }

    if (errorStats.errorsByLevel.error > 0) {
      issues.push(`${errorStats.errorsByLevel.error} critical errors found`);
      recommendations.push('Resolve all critical errors immediately');
    }

    // Check console errors
    const hasConsoleErrors = errorStats.recentErrors?.some(error => 
      error.level === 'error'
    );

    if (hasConsoleErrors) {
      issues.push('Console errors detected');
      recommendations.push('Clear all console errors and warnings');
    }

    return { passed: issues.length === 0, issues, recommendations };
  }

  private async checkDependencies(): Promise<{ passed: boolean; issues: string[]; recommendations: string[] }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for unused dependencies (simplified)
    const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[];
    if (scripts.length > 10) {
      recommendations.push('Consider reducing the number of JavaScript dependencies');
    }

    // Check for CDN usage
    const externalScripts = scripts.filter(script => 
      script.src.includes('://') && !script.src.includes(window.location.hostname)
    );

    externalScripts.forEach(script => {
      if (!script.hasAttribute('integrity')) {
        issues.push(`External script lacks integrity check: ${script.src}`);
        recommendations.push('Add integrity attributes to external scripts');
      }
    });

    return { passed: issues.length === 0, issues, recommendations };
  }

  private checkColorContrast(): Element[] {
    // Simplified color contrast check
    const elements = Array.from(document.querySelectorAll('*'));
    const lowContrastElements: Element[] = [];

    elements.forEach(element => {
      const styles = getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      // This is a simplified check - in production, you'd use a proper contrast ratio calculator
      if (color === 'rgb(128, 128, 128)' && backgroundColor === 'rgb(255, 255, 255)') {
        lowContrastElements.push(element);
      }
    });

    return lowContrastElements;
  }

  // Environment-specific optimizations
  setupProductionOptimizations(): void {
    // Disable development tools in production
    if (process.env.NODE_ENV === 'production') {
      this.disableDevTools();
      this.enableServiceWorker();
      this.optimizeRendering();
    }
  }

  private disableDevTools(): void {
    // Disable React DevTools in production
    if (typeof window !== 'undefined') {
      (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        isDisabled: true,
        supportsFiber: true,
        inject: () => {},
        onCommitFiberRoot: () => {},
        onCommitFiberUnmount: () => {},
      };
    }
  }

  private enableServiceWorker(): void {
    // Register service worker for caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }

  private optimizeRendering(): void {
    // Enable hardware acceleration hints
    document.body.style.transform = 'translateZ(0)';
    
    // Optimize font loading
    if (document.fonts) {
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
      });
    }
  }

  // Cache optimization
  optimizeCaching(): void {
    // Set up cache headers for static assets
    const cacheStrategies = {
      images: 'max-age=31536000', // 1 year
      fonts: 'max-age=31536000',  // 1 year
      css: 'max-age=86400',       // 1 day
      js: 'max-age=86400',        // 1 day
    };

    console.log('Cache optimization strategies:', cacheStrategies);
  }

  // Monitoring setup
  setupProductionMonitoring(): void {
    // Initialize all monitoring systems
    performanceMonitor.init();
    qualityAssurance.init();
    
    // Set up error reporting
    window.addEventListener('error', (event) => {
      errorTracker.captureError(event.error, 'error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Set up performance monitoring alerts
    const vitals = performanceMonitor.getWebVitals();
    if (vitals.lcp && vitals.lcp > 4000) {
      errorTracker.captureError(
        'Poor LCP performance in production',
        'warning',
        { lcp: vitals.lcp }
      );
    }
  }
}

export const productionOptimizer = new ProductionOptimizer();

// Auto-setup in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  productionOptimizer.setupProductionOptimizations();
  productionOptimizer.setupProductionMonitoring();
}

export default productionOptimizer;
