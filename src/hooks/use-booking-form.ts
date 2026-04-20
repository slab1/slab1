
import { useState } from 'react';
import { Table } from '@/api/table';

interface BookingFormState {
  date: Date | undefined;
  time: string;
  guests: string;
  specialRequests: string;
  availableTables: Table[];
  selectedTable: string | null;
  isSubmitting: boolean;
}

interface UseBookingForm {
  date: Date | undefined;
  time: string;
  guests: string;
  specialRequests: string;
  availableTables: Table[];
  selectedTable: string | null;
  isSubmitting: boolean;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setTime: React.Dispatch<React.SetStateAction<string>>;
  setGuests: React.Dispatch<React.SetStateAction<string>>;
  setSpecialRequests: React.Dispatch<React.SetStateAction<string>>;
  setAvailableTables: React.Dispatch<React.SetStateAction<Table[]>>;
  setSelectedTable: React.Dispatch<React.SetStateAction<string | null>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useBookingForm = (): UseBookingForm => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('19:00');
  const [guests, setGuests] = useState<string>('2');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  return {
    date,
    time,
    guests,
    specialRequests,
    availableTables,
    selectedTable,
    isSubmitting,
    setDate,
    setTime,
    setGuests,
    setSpecialRequests,
    setAvailableTables,
    setSelectedTable,
    setIsSubmitting,
  };
};
