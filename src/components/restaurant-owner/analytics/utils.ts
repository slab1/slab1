import { Reservation } from '@/api/types';
import { COLORS } from './constants';
export const processReservationsByDate = (reservationsData: Reservation[], timeRange: 'week' | 'month' | 'year') => {
  const now = new Date();
  const dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  
  // Create a map to count reservations by date
  const reservationsByDate = new Map();
  
  // Filter based on time range
  const filteredData = reservationsData.filter(reservation => {
    const reservationDate = new Date(reservation.reservation_date);
    
    if (timeRange === 'week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      return reservationDate >= oneWeekAgo;
    } else if (timeRange === 'month') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return reservationDate >= oneMonthAgo;
    } else if (timeRange === 'year') {
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return reservationDate >= oneYearAgo;
    }
    
    return true;
  });
  
  // Group by date
  filteredData.forEach(reservation => {
    const date = new Date(reservation.reservation_date);
    const dateString = date.toLocaleDateString('en-US', dateFormat);
    
    if (reservationsByDate.has(dateString)) {
      reservationsByDate.set(dateString, reservationsByDate.get(dateString) + 1);
    } else {
      reservationsByDate.set(dateString, 1);
    }
  });
  
  // Convert map to array for Recharts
  return Array.from(reservationsByDate, ([date, count]) => ({ date, count }));
};

export const processDataByPartySize = (reservationsData: Reservation[]) => {
  const partySizeCounts = new Map<number, number>();
  
  reservationsData.forEach(reservation => {
    const partySize = reservation.guest_count;
    
    if (partySize) {
      if (partySizeCounts.has(partySize)) {
        partySizeCounts.set(partySize, partySizeCounts.get(partySize) + 1);
      } else {
        partySizeCounts.set(partySize, 1);
      }
    }
  });
  
  return Array.from(partySizeCounts, ([size, count]) => ({ 
    name: `${size} people`, 
    value: count 
  }));
};

export const processDataByStatus = (reservationsData: Reservation[]) => {
  const statusCounts = new Map<string, number>();
  
  reservationsData.forEach(reservation => {
    const status = reservation.status;
    
    if (statusCounts.has(status)) {
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    } else {
      statusCounts.set(status, 1);
    }
  });
  
  return Array.from(statusCounts, ([status, count]) => ({ 
    name: status.charAt(0).toUpperCase() + status.slice(1), 
    value: count 
  }));
};

/**
 * Process reservation data to count reservations by hour
 * @param reservationsData Array of reservation objects
 * @returns Array of objects with hour and count properties
 */
export const processDataByHour = (reservationsData: Reservation[]): { hour: number; count: number }[] => {
  // Initialize hours array (0-23)
  const hourCounts = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: 0
  }));

  // Safety check for valid input
  if (!Array.isArray(reservationsData) || reservationsData.length === 0) {
    return hourCounts;
  }

  try {
    // Count reservations by hour
    reservationsData.forEach(reservation => {
      if (reservation && reservation.reservation_time) {
        // Handle different time formats
        let hour: number;
        
        if (typeof reservation.reservation_time === 'string') {
          // Extract hour from time string like "14:30:00" or "14:30"
          const timeParts = reservation.reservation_time.split(':');
          hour = parseInt(timeParts[0], 10);
        } else if (typeof reservation.reservation_time === 'object' && reservation.reservation_time !== null) {
          // Handle Date object
          hour = (reservation.reservation_time as Date).getHours();
        } else {
          // Skip invalid time format
          return;
        }
        
        // Ensure hour is within valid range
        if (hour >= 0 && hour < 24) {
          hourCounts[hour].count += 1;
        }
      }
    });

    return hourCounts;
  } catch (error) {
    console.error("Error processing reservation data by hour:", error);
    return hourCounts;
  }
}
