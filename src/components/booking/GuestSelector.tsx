import React from 'react';
import { Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingFormField } from './BookingFormField';

interface GuestSelectorProps {
  guests: string;
  setGuests: (guests: string) => void;
  maxGuests?: number;
}

export const GuestSelector = ({ guests, setGuests, maxGuests = 20 }: GuestSelectorProps) => {
  const guestOptions = Array.from({ length: maxGuests }, (_, i) => i + 1);

  return (
    <BookingFormField label="Guests">
      <Select value={guests} onValueChange={setGuests}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Number of guests">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              {guests} {parseInt(guests) === 1 ? 'person' : 'people'}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {guestOptions.map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num} {num === 1 ? 'person' : 'people'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BookingFormField>
  );
};
