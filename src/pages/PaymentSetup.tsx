
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

export default function PaymentSetup() {
  const [stripeKeyProvided, setStripeKeyProvided] = useState(false);
  const [testKey, setTestKey] = useState('');

  const validateStripeKey = () => {
    if (testKey.startsWith('sk_test_') || testKey.startsWith('pk_test_')) {
      setStripeKeyProvided(true);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment Setup</h1>
          <p className="text-muted-foreground">
            Configure Stripe payments for reservation deposits
          </p>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Stripe Integration
              </CardTitle>
              <CardDescription>
                Set up payment processing for restaurant reservations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To enable payments, you'll need to add your Stripe secret key to Supabase Edge Functions.
                  This requires clicking the Supabase button in the top-right and configuring secrets.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="stripe-key">Test Stripe Key (for validation)</Label>
                  <Input
                    id="stripe-key"
                    type="password"
                    placeholder="sk_test_... or pk_test_..."
                    value={testKey}
                    onChange={(e) => setTestKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a test key to validate the format (this won't be saved)
                  </p>
                </div>

                <Button onClick={validateStripeKey} disabled={!testKey}>
                  Validate Key Format
                </Button>

                {stripeKeyProvided && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Key format is valid! Now add your actual secret key to Supabase Edge Functions.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Reservation Deposits</span>
                  <span className="text-xs text-muted-foreground">$5-25 per booking</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Secure Payment Processing</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Refund Management</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment History</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Get your Stripe keys</h4>
                <Button asChild variant="outline" size="sm">
                  <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Stripe Dashboard
                  </a>
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">2. Add keys to Supabase</h4>
                <p className="text-sm text-muted-foreground">
                  Click the Supabase button (top-right) → Edge Functions → Secrets → Add STRIPE_SECRET_KEY
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">3. Test payment flow</h4>
                <p className="text-sm text-muted-foreground">
                  Make a test reservation to verify payment processing works
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button asChild variant="outline">
              <a href="/restaurants">Test Reservations</a>
            </Button>
            <Button asChild>
              <a href="/admin">Admin Dashboard</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
