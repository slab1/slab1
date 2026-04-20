
import { useState, useEffect, useCallback } from 'react';
import { securityHardening, type SecurityReport } from '@/utils/security-hardening';

export interface SecurityHookResult {
  securityStatus: SecurityReport | null;
  isChecking: boolean;
  runSecurityCheck: () => Promise<void>;
}

export function useSecurity(): SecurityHookResult {
  const [securityStatus, setSecurityStatus] = useState<SecurityReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runSecurityCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const audit = await securityHardening.performSecurityAudit();
      setSecurityStatus(audit);
    } catch (error) {
      console.error('Security check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // Run initial security check
    runSecurityCheck();
  }, [runSecurityCheck]);

  return {
    securityStatus,
    isChecking,
    runSecurityCheck,
  };
}

export function useInputSanitization() {
  const sanitizeInput = useCallback((input: string, type: 'html' | 'url' | 'text' = 'text') => {
    switch (type) {
      case 'html': {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
      }
      case 'url':
        try {
          const url = new URL(input);
          return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.toString() : '#';
        } catch {
          return '#';
        }
      default:
        return input.replace(/[<>"'&]/g, (char) => {
          const entities: Record<string, string> = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;'
          };
          return entities[char] || char;
        });
    }
  }, []);

  return { sanitizeInput };
}
