import React from 'react';
import { CalendarDays } from 'lucide-react';
import { DateSelector} from './DateSelector';
import { TimeSelector } from './TimeSelector';

interface DateTimeStepProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  time: string;
  setTime: (time: string) => void;
  availableTimes: string[];
}

export const DateTimeStep: React.FC<DateTimeStepProps> = ({ date, setDate, time, setTime, availableTimes }) => {

    const handleDateChange = (newDate: Date | undefined): void => {
      setDate(newDate);
    };
    const handleTimeChange = (time: string): void => {
      setTime(time);
    };
  

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <CalendarDays className="mr-2 h-5 w-5 text-primary" />
        Select Date and Time
      </h3>
      <DateSelector date={date} setDate={handleDateChange} />
      {date && availableTimes.length === 0 ? (
        <p className="text-sm text-destructive font-medium">Restaurant is closed on this day. Please select another date.</p>
      ) : (
        <TimeSelector time={time} setTime={handleTimeChange} availableTimes={availableTimes} />
      )}
    </div>
  );
};