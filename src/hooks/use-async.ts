
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      
      if (isMountedRef.current) {
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
      }
    } catch (error) {
      if (isMountedRef.current) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, loading: false, error: errorObj }));
        onError?.(errorObj);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asyncFunction, onSuccess, onError, ...deps]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
