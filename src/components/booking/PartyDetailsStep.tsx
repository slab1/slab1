import React from 'react';
import { useState } from 'react';
import { Users } from 'lucide-react';
import { GuestSelector } from './GuestSelector';
import { SpecialRequestsField } from './SpecialRequestsField';

interface PartyDetailsStepProps {
  guests: string;
  setGuests: (guests: string) => void;
  specialRequests: string;
  setSpecialRequests: (specialRequests: string) => void;
  maxGuests?: number;
}

export const PartyDetailsStep: React.FC<PartyDetailsStepProps> = ({
  guests,
  setGuests,
  specialRequests,
  setSpecialRequests,
  maxGuests,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <Users className="mr-2 h-5 w-5 text-primary" />
        Party Details
      </h3>
      <GuestSelector guests={guests} setGuests={setGuests} maxGuests={maxGuests} />
      <SpecialRequestsField specialRequests={specialRequests} setSpecialRequests={setSpecialRequests} />
    </div>
  );
};