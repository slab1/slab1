import React from 'react';
import { format } from 'date-fns';
import { DateSelector } from './DateSelector';
import { TimeSelector } from './TimeSelector';
import { GuestSelector } from './GuestSelector';
import { SpecialRequestsField } from './SpecialRequestsField';
import { TableSelector } from './TableSelector';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight, CalendarDays, Users, Clock, Table, MessageSquare, CreditCard } from 'lucide-react';

interface StepContentProps {
  step: number;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  time: string;
  setTime: (time: string) => void;
  availableTimes: string[];
  guests: string;
  setGuests: (guests: string) => void;
  specialRequests: string;
  setSpecialRequests: (requests: string) => void;
  availableTables: any[];
  selectedTable: string | null;
  setSelectedTable: (tableId: string | null) => void;
  checkAvailability: () => void;
  isSubmitting: boolean;
  depositAmount: number;
}

export const StepContent: React.FC<StepContentProps> = ({
  step,
  date,
  setDate,
  time,
  setTime,
  availableTimes,
  guests,
  setGuests,
  specialRequests,
  setSpecialRequests,
  availableTables,
  selectedTable,
  setSelectedTable,
  checkAvailability,
  isSubmitting,
  depositAmount
}) => {
  switch (step) {
    case 1:
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Select Date and Time
          </h3>
          <DateSelector date={date} setDate={setDate} />
          <TimeSelector time={time} setTime={setTime} availableTimes={availableTimes} />
        </div>
      );
    case 2:
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Party Details
          </h3>
          <GuestSelector guests={guests} setGuests={setGuests} />
          <SpecialRequestsField specialRequests={specialRequests} setSpecialRequests={setSpecialRequests} />
        </div>
      );
    case 3:
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Table className="mr-2 h-5 w-5 text-primary" />
            Table Selection
          </h3>
          {availableTables.length === 0 ? (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="mb-4">Let's check if tables are available for your party</p>
              <Button 
                onClick={checkAvailability}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Checking...' : 'Check Availability'}
              </Button>
            </div>
          ) : (
            <TableSelector 
              availableTables={availableTables} 
              selectedTable={selectedTable} 
              setSelectedTable={setSelectedTable}
              viewMode="visual" // Use the visual mode by default
            />
          )}
        </div>
      );
    case 4:
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-primary" />
            Confirm Reservation
          </h3>
          <div className="space-y-3 border rounded-md p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{date ? format(date, 'EEEE, MMMM d') : 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Party Size:</span>
              <span className="font-medium">{guests} guests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Table:</span>
              <span className="font-medium">
                {selectedTable ? `Table ${availableTables.find(t => t.id === selectedTable)?.table_number}` : 'Not selected'}
              </span>
            </div>
            {specialRequests && (
              <div>
                <span className="text-muted-foreground">Special Requests:</span>
                <p className="mt-1 text-sm">{specialRequests}</p>
              </div>
            )}
            <div className="pt-3 border-t mt-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-muted-foreground">Deposit:</span>
                </div>
                <span className="font-medium">${depositAmount}.00</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Refundable with 24hr cancellation notice
              </p>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export const NavigationButtons: React.FC<{
  step: number;
  nextStep: () => void;
  prevStep: () => void;
  isSubmitting: boolean;
  availableTables: any[];
  handleInitiateBooking: () => void;
}> = ({ step, nextStep, prevStep, isSubmitting, availableTables, handleInitiateBooking }) => {
  return (
    <div className={`mt-6 ${step > 1 ? 'flex justify-between' : 'flex justify-end'}`}>
      {step > 1 && (
        <Button 
          type="button" 
          variant="outline"
          onClick={prevStep}
        >
          Back
        </Button>
      )}
      
      {step < 4 ? (
        <Button 
          type="button" 
          onClick={nextStep}
          disabled={step === 3 && availableTables.length === 0 && isSubmitting}
        >
          {step === 3 && availableTables.length === 0 ? (
            isSubmitting ? 'Checking...' : 'Check Availability'
          ) : (
            <>
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      ) : (
        <Button 
          onClick={handleInitiateBooking}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Complete Reservation'}
        </Button>
      )}
    </div>
  );
};

export const ProgressSteps: React.FC<{
  step: number;
  isMobile: boolean;
}> = ({ step, isMobile }) => {
  const progressSteps = [
    { name: 'Date & Time', icon: CalendarDays },
    { name: 'Party Details', icon: Users },
    { name: 'Table', icon: Table },
    { name: 'Confirm', icon: CheckCircle }
  ];
  
  if (isMobile) {
    return (
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">Step {step} of 4</p>
        <div className="text-sm text-muted-foreground">{progressSteps[step-1].name}</div>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between">
        {progressSteps.map((stepItem, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center w-1/4 ${index < step ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index + 1 === step 
                  ? 'bg-primary text-white' 
                  : index + 1 < step 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              <stepItem.icon className="h-5 w-5" />
            </div>
            <span className={`text-xs mt-2 ${index + 1 === step ? 'font-medium' : ''}`}>{stepItem.name}</span>
          </div>
        ))}
      </div>
      <div className="w-full bg-muted h-1 mt-3 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300" 
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    </div>
  );
};
