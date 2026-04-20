
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isLoading: boolean;
  threshold?: number;
}

export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
  isLoading,
  threshold = 300
}: UseInfiniteScrollProps) {
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (isLoading || isFetching || !hasNextPage) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      setIsFetching(true);
    }
  }, [isLoading, isFetching, hasNextPage, threshold]);

  useEffect(() => {
    if (!isFetching) return;

    const fetchMore = async () => {
      await fetchNextPage();
      setIsFetching(false);
    };

    fetchMore();
  }, [isFetching, fetchNextPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { isFetching };
}
