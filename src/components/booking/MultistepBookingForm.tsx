import React, { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateTimeStep } from './DateTimeStep';
import { PartyDetailsStep } from './PartyDetailsStep';
import { TableSelectionStep } from './TableSelectionStep';
import { ConfirmReservationStep } from './ConfirmReservationStep';
import { Table, Restaurant, TableCombination } from '@/api/types';
import { useAuth } from '@/hooks/use-auth';
import { tableApi } from '@/api/table';
import { reservationApi } from '@/api/reservation';
import { NotificationService } from '@/services/notification-service';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StripePaymentForm } from '../payment/StripePaymentForm';
import { BookingState, GroupedCombination, AvailableTableResponse } from './MultistepBookingForm.types';
import { combineDateTime } from '@/lib/utils';

interface MultistepBookingFormProps {
  locationId: string;
  restaurantId: string;
  restaurantName: string;
  restaurant?: Restaurant;
  className?: string;
}

const processTablesAndCombinations = (tables: AvailableTableResponse[]) => {
  const processedTables = tables.filter(t => !t.combination_id);
  const combinations = tables.filter(t => t.combination_id);
  
  const groupedCombinations = combinations.reduce((acc, curr) => {
    if (curr.combination_id) {
      if (!acc[curr.combination_id]) {
        acc[curr.combination_id] = {
          id: curr.combination_id,
          capacity: curr.capacity,
          is_combination: true,
          table_ids: [],
          is_preferred: curr.is_preferred
        };
      }
      acc[curr.combination_id].table_ids.push(curr.id);
    }
    return acc;
  }, {} as Record<string, GroupedCombination>);
  
  return {
    processedTables,
    finalCombinations: Object.values(groupedCombinations)
  };
};

const MultistepBookingForm = ({ locationId, restaurantId, restaurantName, restaurant, className }: MultistepBookingFormProps) => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('');
  const [guests, setGuests] = useState<string>('2');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [availableCombinations, setAvailableCombinations] = useState<GroupedCombination[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedCombinationId, setSelectedCombinationId] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignInRedirect = () => {
    // Save current state to sessionStorage
    const stateToSave: BookingState = {
      step,
      date: date?.toISOString(),
      time,
      guests,
      specialRequests,
      selectedTable,
      selectedCombinationId,
      restaurantId
    };
    sessionStorage.setItem(`booking_state_${restaurantId}`, JSON.stringify(stateToSave));
    navigate('/login', { state: { from: window.location.pathname } });
  };

  // Dynamically generate available times based on restaurant operating hours
  const getAvailableTimes = useCallback(() => {
    if (!restaurant || !date) {
      return ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
    }

    let openingHours = restaurant.opening_hours;
    if (typeof openingHours === 'string') {
      try {
        openingHours = JSON.parse(openingHours);
      } catch (e) {
        console.error("Error parsing opening hours:", e);
        return ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
      }
    }

    if (!openingHours) {
      return ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
    }

    const dayName = format(date, 'eeee').toLowerCase();
    const hours = openingHours[dayName];

    if (!hours || hours.closed) {
      return [];
    }

    const times = [];
    let current = hours.open || '09:00';
    const end = hours.close || '22:00';
    
    const isToday = date ? format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') : false;
    const now = new Date();

    while (current <= end) {
      // If it's today, only add times that are in the future
      if (isToday) {
        const [h, m] = current.split(':').map(Number);
        // Add a buffer (e.g., 30 minutes) to current time for same-day bookings
        const bookingBufferMinutes = restaurant?.settings?.min_advance_booking_hours ? 
          restaurant.settings.min_advance_booking_hours * 60 : 30;
          
        const timeToCheck = combineDateTime(date!, current);
        
        const earliestAllowed = new Date(now.getTime() + bookingBufferMinutes * 60000);
        
        if (timeToCheck >= earliestAllowed) {
          times.push(current);
        }
      } else {
        times.push(current);
      }
      
      const [h, m] = current.split(':').map(Number);
      const nextM = m + 30;
      const nextH = h + Math.floor(nextM / 60);
      current = `${String(nextH).padStart(2, '0')}:${String(nextM % 60).padStart(2, '0')}`;
      if (current > end) break;
    }

    return times;
  }, [restaurant, date]);

  const availableTimes = getAvailableTimes();

  // Ensure a valid time is selected when date or restaurant changes
  useEffect(() => {
    if (availableTimes.length > 0) {
      if (!time || !availableTimes.includes(time)) {
        setTime(availableTimes[0]);
      }
    } else {
      setTime('');
    }
  }, [availableTimes, time]);

  const checkAvailability = useCallback(async () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    const finalLocationId = locationId || restaurant?.locations?.[0]?.id;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    try {
      setIsSubmitting(true);
      
      // Validate inputs before making API call
      const guestCount = parseInt(guests);
      if (isNaN(guestCount) || guestCount < 1) {
        throw new Error('Invalid number of guests');
      }

      // First check if restaurant has any tables configured
      if (!finalLocationId) {
        // No location - check if restaurant has any tables at all
        const allTables = await tableApi.getByRestaurantId(restaurantId);
        if (allTables.length === 0) {
          toast.error('This restaurant hasn\'t configured online booking yet. Please contact them directly to make a reservation.');
          setAvailableTables([]);
          setSelectedTable(null);
          return;
        }
        toast.error('Restaurant location not available. Please try again later.');
        return;
      }
      
      const tables = await tableApi.getAvailableTablesEnhanced(finalLocationId, formattedDate, time, guestCount) as AvailableTableResponse[];
      
      if (!Array.isArray(tables)) {
        throw new Error('Invalid response from server');
      }
      
      const { processedTables, finalCombinations } = processTablesAndCombinations(tables);
      
      setAvailableTables(processedTables);
      setAvailableCombinations(finalCombinations);
      
      if (processedTables.length === 0 && finalCombinations.length === 0) {
        // Provide more specific error messaging
        const allTables = await tableApi.getByRestaurantId(restaurantId);
        if (allTables.length === 0) {
          toast.error('This restaurant hasn\'t configured tables for online booking. Please contact them directly.');
        } else {
          toast.error(`No tables available for ${guestCount} guests at ${time}. Try a different time or reduce your party size.`);
        }
        setSelectedTable(null);
        setSelectedCombinationId(null);
      } else {
        // Prefer combinations for larger parties if available
        if (finalCombinations.length > 0) {
          setSelectedCombinationId(finalCombinations[0].id);
          setSelectedTable(null);
        } else {
          setSelectedTable(processedTables[0].id);
          setSelectedCombinationId(null);
        }
        
        const totalAvailable = processedTables.length + finalCombinations.length;
        toast.success(`${totalAvailable} ${totalAvailable === 1 ? 'option' : 'options'} available!`);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check table availability';
      toast.error(errorMessage + '. Please try again.');
      setAvailableTables([]);
      setSelectedTable(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [date, locationId, restaurant, restaurantId, time, guests]);

  // Restore state from sessionStorage if it exists
  useEffect(() => {
    const savedState = sessionStorage.getItem(`booking_state_${restaurantId}`);
    if (savedState) {
      try {
        const state: BookingState = JSON.parse(savedState);
        setStep(state.step);
        if (state.date) setDate(new Date(state.date));
        setTime(state.time);
        setGuests(state.guests);
        setSpecialRequests(state.specialRequests);
        setSelectedTable(state.selectedTable);
        setSelectedCombinationId(state.selectedCombinationId);
        
        // After restoring, we might need to re-check availability if we were on step 3 or 4
        if (state.step >= 3 && user) {
          checkAvailability();
        }
        
        // Only clear if user is logged in (meaning they finished the auth flow)
        if (user) {
          sessionStorage.removeItem(`booking_state_${restaurantId}`);
        }
      } catch (e) {
        console.error("Error restoring booking state:", e);
      }
    }
  }, [restaurantId, user, checkAvailability]);

  const handleSubmit = async () => {
    if (!user) {
      handleSignInRedirect();
      return;
    }

    if (!date || (!selectedTable && !selectedCombinationId)) {
      toast.error('Please select a date and table');
      return;
    }

    const finalLocationId = locationId || restaurant?.locations?.[0]?.id;
    if (!finalLocationId) {
      toast.error('Restaurant location not available');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Re-verify availability one last time before creating reservation
      const formattedDate = format(date, 'yyyy-MM-dd');
      const guestCount = parseInt(guests);
      const tables = await tableApi.getAvailableTablesEnhanced(finalLocationId, formattedDate, time, guestCount) as AvailableTableResponse[];
      
      if (!Array.isArray(tables)) {
        throw new Error('Failed to verify availability');
      }

      let isStillAvailable = false;
      if (selectedCombinationId) {
        isStillAvailable = tables.some(t => t.combination_id === selectedCombinationId);
      } else {
        isStillAvailable = tables.some(t => t.id === selectedTable && !t.combination_id);
      }

      if (!isStillAvailable) {
        toast.error('The selected table is no longer available. Please choose another table or time.');
        // Refresh available tables/combinations
        const { processedTables, finalCombinations } = processTablesAndCombinations(tables);
        
        setAvailableTables(processedTables);
        setAvailableCombinations(finalCombinations);
        setStep(3);
        return;
      }

      console.log('Creating reservation...');

      const depositAmount = restaurant?.settings?.deposit_amount || (restaurant?.settings?.require_deposit ? 25 : 0);

      const reservationData = {
        user_id: user.id,
        restaurant_id: restaurantId,
        restaurant_location_id: finalLocationId,
        table_id: selectedTable || undefined,
        combination_id: selectedCombinationId || undefined,
        reservation_date: formattedDate,
        reservation_time: time,
        guest_count: guestCount,
        special_requests: specialRequests || undefined,
        status: depositAmount > 0 ? 'pending' : 'confirmed' as const,
      };

      const result = await reservationApi.create(reservationData);
      
      if (result && typeof result === 'object' && 'id' in result) {
        setReservationId(String(result.id));
        
        // Use NotificationService to handle all notifications (admin, customer email/SMS/push)
        NotificationService.sendBookingNotifications(result, restaurantName);

        if (depositAmount > 0) {
          setStep(5); // Move to payment step
          toast.info('Reservation created. Please complete the deposit payment.');
        } else {
        setStep(6); // Move to final confirmation step
        toast.success('Reservation created successfully!');
      }
      } else {
        throw new Error('Failed to create reservation - invalid response');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create reservation';
      toast.error(errorMessage + '. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1: {
        if (!date) {
          toast.error('Please select a reservation date');
          return false;
        }
        if (!time) {
          toast.error('Please select a reservation time');
          return false;
        }
        // Check if selected date/time is in the past
        const selectedDateTime = combineDateTime(date, time);
        
        const now = new Date();
        // Add a small buffer (5 minutes) for the validation check to account for processing time
        const nowWithBuffer = new Date(now.getTime() - 5 * 60000);
        
        if (selectedDateTime <= nowWithBuffer) {
          toast.error('Please select a future date and time');
          return false;
        }
        return true;
      }
      case 2: {
        const guestCount = parseInt(guests);
        const maxPartySize = restaurant?.settings?.max_party_size || 20;
        if (isNaN(guestCount) || guestCount < 1 || guestCount > maxPartySize) {
          toast.error(`Please select a valid number of guests (1-${maxPartySize})`);
          return false;
        }
        return true;
      }
      case 3: {
        if (!selectedTable && !selectedCombinationId) {
          toast.error('Please select a table or combination');
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (!validateStep(step)) {
      return;
    }

    if (step === 2) {
      // Validate guest count before checking availability
      if (!validateStep(2)) return;
      
      try {
        setIsSubmitting(true);
        await checkAvailability();
        setStep(3);
      } catch (error) {
        // Error toast is already shown in checkAvailability
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step === 3 && availableTables.length === 0) {
      await checkAvailability();
      return;
    }
    setStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleViewReservation = () => {
    if (reservationId) {
      navigate(`/reservation/${reservationId}`);
    } else {
      navigate('/reservations');
    }
  };

  const handleMakeAnother = () => {
    // Reset form
    setStep(1);
    setDate(new Date());
    setTime('19:00');
    setGuests('2');
    setSpecialRequests('');
    setAvailableTables([]);
    setAvailableCombinations([]);
    setSelectedTable(null);
    setSelectedCombinationId(null);
    setReservationId(null);
  };

  const getRestaurantAddress = () => {
    if (!restaurant) return '';
    const loc = restaurant.locations?.[0];
    if (!loc) return '';
    const parts = [loc.address, loc.city, loc.state].filter(Boolean);
    return parts.join(', ');
  };

  const depositAmount = restaurant?.settings?.deposit_amount || (restaurant?.settings?.require_deposit ? 25 : 0);

  return (
    <Card className={cn("w-full max-w-2xl mx-auto relative", className)}>
      {isSubmitting && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Processing...</p>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-center">
          {step === 6 ? 'Reservation Confirmed!' : 
           step === 5 ? 'Secure Your Reservation' : 
           `Reserve a Table at ${restaurantName}`}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 6
            ? 'Your reservation has been successfully created'
            : step === 5
            ? 'Please complete the required deposit'
            : `Step ${step} of 4`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <DateTimeStep
            date={date}
            time={time}
            availableTimes={availableTimes}
            setDate={setDate}
            setTime={setTime}
          />
        )}

        {step === 2 && (
          <PartyDetailsStep
            guests={guests}
            specialRequests={specialRequests}
            setGuests={setGuests}
            setSpecialRequests={setSpecialRequests}
            maxGuests={restaurant?.settings?.max_party_size || 20}
          />
        )}

        {step === 3 && (
          <TableSelectionStep
            availableTables={availableTables}
            availableCombinations={availableCombinations}
            selectedTable={selectedTable}
            selectedCombinationId={selectedCombinationId}
            setSelectedTable={setSelectedTable}
            setSelectedCombinationId={setSelectedCombinationId}
            checkAvailability={checkAvailability}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 4 && (
          <ConfirmReservationStep
            date={date}
            time={time}
            guests={guests}
            specialRequests={specialRequests}
            selectedTable={selectedTable}
            selectedCombinationId={selectedCombinationId}
            availableTables={availableTables}
            availableCombinations={availableCombinations}
            restaurantName={restaurantName}
            depositAmount={depositAmount}
            restaurantAddress={getRestaurantAddress()}
          />
        )}

        {step === 5 && reservationId && (
          <div className="space-y-6">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <p className="text-sm text-center">
                To confirm your reservation at <strong>{restaurantName}</strong>, 
                a deposit of <strong>${depositAmount.toFixed(2)}</strong> is required.
              </p>
            </div>
            <StripePaymentForm
              amount={depositAmount}
              reservationId={reservationId}
              restaurantId={restaurantId}
              description={`Deposit for reservation at ${restaurantName}`}
              onPaymentSuccess={() => {
                setStep(6);
                toast.success('Payment successful! Your reservation is confirmed.');
              }}
              onPaymentError={() => {
                toast.error('Payment failed. Please try again or contact support.');
              }}
            />
          </div>
        )}

        {step === 6 && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Reservation Confirmed!</h3>
              <p className="text-muted-foreground mb-4">
                Your reservation at {restaurantName} has been successfully created and confirmed.
              </p>
              
              {reservationId && (
                <div className="bg-muted p-3 rounded-md inline-block">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Reservation ID</p>
                  <p className="text-sm font-mono font-bold">{reservationId}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleViewReservation} className="flex-1">
                View Reservation Details
              </Button>
              <Button variant="outline" onClick={handleMakeAnother} className="flex-1">
                Make Another Reservation
              </Button>
            </div>
          </div>
        )}

        {step < 5 && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
            >
              Previous
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={nextStep}
                disabled={isSubmitting || (step === 3 && !selectedTable && !selectedCombinationId)}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking...
                  </>
                ) : 'Next'}
              </Button>
            ) : (
              <Button
                onClick={user ? handleSubmit : handleSignInRedirect}
                disabled={isSubmitting || (!selectedTable && !selectedCombinationId)}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : !user ? 'Sign in to Book' : depositAmount > 0 ? 'Go to Payment' : 'Confirm Reservation'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultistepBookingForm;
