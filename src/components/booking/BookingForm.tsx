
import React from 'react';
import MultistepBookingForm from './MultistepBookingForm';
import { Restaurant } from '@/api/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface BookingFormProps {
  restaurant: Restaurant;
  className?: string;
}

export const BookingForm = ({ restaurant, className }: BookingFormProps) => {
  if (!restaurant) {
    console.error("BookingForm received null restaurant");
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md text-yellow-800">
        Restaurant information is not available
      </div>
    );
  }

  // Use the first location if available, or create a mock location ID
  const locationId = restaurant.locations?.[0]?.id || restaurant.id;
  const restaurantName = restaurant.name;
  
  return (
    <ErrorBoundary>
      <MultistepBookingForm 
        locationId={locationId}
        restaurantId={restaurant.id}
        restaurantName={restaurantName} 
        restaurant={restaurant}
        className={className} 
      />
    </ErrorBoundary>
  );
};
