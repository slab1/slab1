
import { useState } from 'react';
import { Check, CreditCard, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { StripePaymentForm } from './StripePaymentForm';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  reservationId?: string;
  restaurantId?: string;
  restaurantName: string;
  onSuccess: (paymentData?: any) => void;
  onError?: (error: any) => void;
}

export function PaymentModal({
  open,
  onClose,
  amount,
  reservationId,
  restaurantId,
  restaurantName,
  onSuccess,
  onError
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('card');

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit Card',
      description: 'Pay with Visa, Mastercard or American Express',
      icon: CreditCard,
    },
    {
      id: 'applepay',
      name: 'Apple Pay',
      description: 'Pay with Apple Pay if your device supports it',
      icon: CreditCard,
    }
  ];

  const handlePaymentSuccess = (paymentData: any) => {
    toast.success('Payment successful!', {
      description: `Your deposit of $${amount}.00 has been processed successfully.`
    });
    onSuccess(paymentData);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    if (onError) {
      onError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Reservation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Booking Details</p>
            <div className="rounded-md border p-4 bg-muted/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-primary">{restaurantName}</p>
                  <p className="text-sm text-muted-foreground">Reservation Deposit</p>
                </div>
                <p className="text-lg font-bold">${amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {selectedMethod === 'card' && reservationId && restaurantId ? (
            <div className="mt-4">
              <StripePaymentForm 
                amount={amount}
                reservationId={reservationId}
                restaurantId={restaurantId}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                allowSaveCard={true}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Select Payment Method</p>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all ${
                        selectedMethod === method.id ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-muted w-10 h-10 rounded-md flex items-center justify-center">
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      {selectedMethod === method.id && (
                        <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="rounded-md border p-3 bg-muted/40">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <p className="text-xs">
                    Your payment information is secure and encrypted. Refundable with 24hr cancellation notice.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!reservationId || !restaurantId ? (
          <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md text-sm text-yellow-800">
            Missing reservation details. Please try again from the booking page.
          </div>
        ) : null}

        {selectedMethod !== 'card' && (
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              <X className="h-4 w-4 mr-2" /> 
              Cancel
            </Button>
            <Button onClick={() => setSelectedMethod('card')} disabled={isProcessing || !reservationId || !restaurantId}>
              Continue to Payment
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
