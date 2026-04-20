
import { useEffect, useRef } from 'react';

export function useScreenReader() {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const ScreenReaderAnnouncer = () => (
    <div
      ref={announceRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );

  return { announce, ScreenReaderAnnouncer };
}
