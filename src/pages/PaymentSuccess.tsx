
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const paymentId = searchParams.get('id');
  const provider = searchParams.get('provider') || 'stripe';

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        setIsVerifying(false);
        return;
      }

      try {
        // Verify the payment with our edge function
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { paymentId, provider },
        });

        if (error) throw error;
        
        setPaymentDetails(data.payment);
        
        if (data.success) {
          toast.success("Payment was successful!");
        } else {
          toast.warning("Payment verification is still pending");
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error("Failed to verify payment");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [paymentId, provider]);

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-2" />
          <CardTitle>Payment Successful</CardTitle>
          <CardDescription>
            {isVerifying ? 'Verifying your payment...' : 'Your payment has been processed successfully'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isVerifying ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : paymentDetails ? (
            <div className="space-y-2 border rounded-md p-4 bg-muted/10">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-mono text-sm">{paymentDetails.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span>
                  {paymentDetails.currency === 'ngn' ? '₦' : '$'}
                  {paymentDetails.amount.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                  {paymentDetails.status}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No payment details found. If you believe this is an error, please contact support.
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button asChild>
            <a href="/">Return Home</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
