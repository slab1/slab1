
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChefBookingForm } from '@/components/chefs/ChefBookingForm';
import { Chef } from '@/api/types';

interface ChefBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chef: Chef;
  onSuccess?: () => void;
}

export function ChefBookingDialog({ isOpen, onClose, chef, onSuccess }: ChefBookingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Book Chef {chef.name}</DialogTitle>
        </DialogHeader>
        <ChefBookingForm 
          chef={chef} 
          onCancel={onClose}
          onSuccess={() => {
            if (onSuccess) onSuccess();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
