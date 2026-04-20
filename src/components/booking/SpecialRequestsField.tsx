
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { BookingFormField } from './BookingFormField';

interface SpecialRequestsFieldProps {
  specialRequests: string;
  setSpecialRequests: (requests: string) => void;
}

export const SpecialRequestsField = ({ specialRequests, setSpecialRequests }: SpecialRequestsFieldProps) => {
  return (
    <BookingFormField label="Special requests">
      <Textarea 
        id="special-requests" 
        placeholder="Any allergies, special occasions, or seating preferences?"
        value={specialRequests}
        onChange={(e) => setSpecialRequests(e.target.value)}
        className="min-h-[80px]"
      />
    </BookingFormField>
  );
};
