
import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  disabled?: boolean;
}

export function useKeyboardNavigation({
  onEnter,
  onSpace,
  onEscape,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  disabled = false
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
    }
  }, [onEnter, onSpace, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, disabled]);

  useEffect(() => {
    if (!disabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, disabled]);

  return { handleKeyDown };
}
