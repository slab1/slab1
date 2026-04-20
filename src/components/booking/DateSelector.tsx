import React, { useState } from 'react';
import { format, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { BookingFormField } from './BookingFormField';

interface DateSelectorProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export const DateSelector = ({ date, setDate }: DateSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      setOpen(false);
    }
  };

  return (
    <BookingFormField label="Date">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'EEEE, MMMM d, yyyy') : <span>Select date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            disabled={(date) => date < startOfDay(new Date())}
          />
        </PopoverContent>
      </Popover>
    </BookingFormField>
  );
};
