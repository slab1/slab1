
import React from 'react';
import { Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingFormField } from './BookingFormField';

interface TimeSelectorProps {
  time: string;
  setTime: (time: string) => void;
  availableTimes: string[];
}

export const TimeSelector = ({ time, setTime, availableTimes }: TimeSelectorProps) => {
  return (
    <BookingFormField label="Time">
      <Select value={time} onValueChange={setTime}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select time">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {time}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableTimes.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BookingFormField>
  );
};
