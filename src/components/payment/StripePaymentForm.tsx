import React, { useState, useEffect, useCallback } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Lock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PaymentMethod, StripePaymentIntent } from '@/api/types';

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  reservationId: string;
  restaurantId: string;
  description?: string;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: any) => void;
  allowSaveCard?: boolean;
}

export function StripePaymentForm({
  amount,
  currency = 'usd',
  reservationId,
  restaurantId,
  description,
  onPaymentSuccess,
  onPaymentError,
  allowSaveCard = true
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Load saved payment methods
  useEffect(() => {
    if (allowSaveCard) {
      loadSavedCards();
    }
  }, [allowSaveCard]);

  const loadSavedCards = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('provider', 'stripe')
        .order('is_default', { ascending: false });

      if (error) throw error;
      setSavedCards((data || []) as any);
    } catch (error) {
      console.error('Error loading saved cards:', error);
    }
  };

  const createPaymentIntent = useCallback(async () => {
    try {
      // Call Supabase function to create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          reservation_id: reservationId,
          restaurant_id: restaurantId,
          description: description || `Reservation payment - ${reservationId.slice(0, 8)}`
        }
      });

      if (error) throw error;

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error('No client secret received');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to initialize payment. Please try again.');
      onPaymentError?.(error);
    }
  }, [amount, currency, reservationId, restaurantId, description, onPaymentError]);

  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntent();
  }, [createPaymentIntent]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe not initialized');
      return;
    }

    if (!clientSecret) {
      toast.error('Payment not ready. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      let paymentMethod;

      if (selectedCardId) {
        // Use saved card
        const selectedCard = savedCards.find(card => card.id === selectedCardId);
        if (!selectedCard) {
          throw new Error('Selected card not found');
        }

        // Create payment method from saved card
        paymentMethod = { id: selectedCard.provider_payment_method_id };
      } else {
        // Use new card details
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card element not found');
        }

        const { error, paymentMethod: newPaymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            phone: billingDetails.phone_number,
            address: {
              line1: billingDetails.address.line1,
              line2: billingDetails.address.line2,
              city: billingDetails.address.city,
              state: billingDetails.address.state,
              postal_code: billingDetails.address.postal_code,
              country: billingDetails.address.country
            }
          }
        });

        if (error) {
          throw error;
        }

        paymentMethod = newPaymentMethod;
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
        setup_future_usage: saveCard && !selectedCardId ? 'off_session' : undefined,
        receipt_email: billingDetails.email
      });

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Save payment method if requested
        if (saveCard && !selectedCardId && paymentMethod.id) {
          await savePaymentMethod(paymentMethod);
        }

        // Record payment in database
        await recordPayment(paymentIntent);

        toast.success('Payment successful!');
        onPaymentSuccess?.({
          paymentIntent,
          amount,
          currency,
          reservationId
        });
      } else {
        throw new Error('Payment failed');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      onPaymentError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const savePaymentMethod = async (paymentMethod: any) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: 'card',
          provider: 'stripe',
          provider_payment_method_id: paymentMethod.id,
          last4: paymentMethod.card?.last4,
          brand: paymentMethod.card?.brand,
          expiry_month: paymentMethod.card?.exp_month,
          expiry_year: paymentMethod.card?.exp_year,
          billing_details: paymentMethod.billing_details,
          is_default: savedCards.length === 0 // First card is default
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const recordPayment = async (paymentIntent: any) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // 1. Record the payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          reservation_id: reservationId,
          user_id: user.id,
          restaurant_id: restaurantId,
          amount: amount,
          currency: currency,
          status: 'succeeded',
          provider: 'stripe',
          provider_payment_intent_id: paymentIntent.id,
          provider_charge_id: paymentIntent.charges?.data?.[0]?.id,
          description: description,
          completed_at: new Date().toISOString()
        }]);

      if (paymentError) throw paymentError;

      // 2. Update the reservation status to 'confirmed'
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', reservationId)
        .eq('status', 'pending');

      if (reservationError) {
        console.error('Error updating reservation status:', reservationError);
        // We don't throw here as the payment was already successful
      }
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Saved Cards */}
          {allowSaveCard && savedCards.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Saved Cards</Label>
              <div className="space-y-2">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCardId === card.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4" />
                        <span className="text-sm">
                          •••• •••• •••• {card.last4}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {card.brand}
                        </span>
                        {card.is_default && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {card.expiry_month}/{card.expiry_year}
                      </span>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCardId(null)}
                  className="w-full"
                >
                  Use New Card
                </Button>
              </div>
            </div>
          )}

          {/* New Card Form */}
          {!selectedCardId && (
            <>
              {/* Billing Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={billingDetails.name}
                    onChange={(e) => setBillingDetails(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={billingDetails.email}
                    onChange={(e) => setBillingDetails(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    required
                  />
                </div>
              </div>

              {/* Card Element */}
              <div className="space-y-2">
                <Label>Card Information</Label>
                <div className="p-3 border rounded-md bg-white">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address Line 1</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St"
                    value={billingDetails.address.line1}
                    onChange={(e) => setBillingDetails(prev => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={billingDetails.address.city}
                    onChange={(e) => setBillingDetails(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    value={billingDetails.address.state}
                    onChange={(e) => setBillingDetails(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="10001"
                    value={billingDetails.address.postal_code}
                    onChange={(e) => setBillingDetails(prev => ({
                      ...prev,
                      address: { ...prev.address, postal_code: e.target.value }
                    }))}
                  />
                </div>
              </div>

              {/* Save Card Option */}
              {allowSaveCard && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveCard"
                    checked={saveCard}
                    onCheckedChange={(checked) => setSaveCard(checked === true)}
                  />
                  <Label htmlFor="saveCard" className="text-sm">
                    Save this card for future payments
                  </Label>
                </div>
              )}
            </>
          )}

          {/* Payment Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Amount</span>
              <span className="text-lg font-bold">
                ${amount.toFixed(2)} {currency.toUpperCase()}
              </span>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
            <Lock className="h-4 w-4 ml-auto" />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || isProcessing || !clientSecret}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
