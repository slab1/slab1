
import { useRef, useEffect } from 'react';

export function useFocusManagement() {
  const focusableElementsQuery = 'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])';
  
  const trapFocus = (containerRef: React.RefObject<HTMLElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(focusableElementsQuery);
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  };

  const focusFirstElement = (containerRef: React.RefObject<HTMLElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const firstFocusable = container.querySelector(focusableElementsQuery) as HTMLElement;
    firstFocusable?.focus();
  };

  return { trapFocus, focusFirstElement };
}
