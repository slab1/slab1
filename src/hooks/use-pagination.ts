
import { useState, useMemo, useEffect } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

export function usePagination({
  totalItems,
  itemsPerPage,
  initialPage = 1
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    // Sync currentPage with initialPage if it's provided and different
    if (initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage, currentPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return { startIndex, endIndex };
  }, [currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    const newTotalPages = Math.ceil(totalItems / itemsPerPage);
    if (page >= 1 && page <= newTotalPages) {
      setCurrentPage(page);
    } else if (page >= 1 && newTotalPages === 0) {
      // Allow setting page even if total is not known yet
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}
