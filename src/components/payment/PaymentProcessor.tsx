
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, Receipt } from "lucide-react";
import { restaurantPaymentApi } from "@/api/restaurant/payment";
import { toast } from "sonner";

interface PaymentProcessorProps {
  restaurantId: string;
  onPaymentComplete?: (paymentData: any) => void;
}

export function PaymentProcessor({ restaurantId, onPaymentComplete }: PaymentProcessorProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState('demo');
  const [memo, setMemo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading('Processing payment...');

      let result;
      const paymentAmount = parseFloat(amount);

      if (paymentType === 'demo') {
        result = await restaurantPaymentApi.createDemoPayment(restaurantId, paymentAmount, description);
      } else if (paymentType === 'memo') {
        if (!memo.trim()) {
          toast.error('Please enter a memo for memo payments');
          return;
        }
        result = await restaurantPaymentApi.createMemoPayment(restaurantId, paymentAmount, description, memo);
      }

      toast.dismiss();

      if (result && result.clientSecret) {
        toast.success('Payment processed successfully!');
        
        // Reset form
        setAmount('');
        setDescription('');
        setMemo('');
        
        // Call completion callback
        if (onPaymentComplete) {
          onPaymentComplete(result);
        }
      } else {
        toast.error('Failed to process payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.dismiss();
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Process Payment
        </CardTitle>
        <CardDescription>
          Create demo or memo payments for testing and administrative purposes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demo">Demo Payment</SelectItem>
                <SelectItem value="memo">Memo Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Payment description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {paymentType === 'memo' && (
          <div className="space-y-2">
            <Label htmlFor="memo">Memo</Label>
            <Input
              id="memo"
              placeholder="Additional memo information..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        )}

        <Button
          onClick={handleProcessPayment}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            'Processing...'
          ) : (
            <>
              <Receipt className="h-4 w-4 mr-2" />
              Process Payment
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
