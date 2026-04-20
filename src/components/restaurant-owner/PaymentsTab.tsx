
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentDashboard } from "@/components/payment/PaymentDashboard";

interface PaymentsTabProps {
  restaurantId?: string;
}

export function PaymentsTab({ restaurantId }: PaymentsTabProps) {
  if (!restaurantId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>No restaurant selected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please select a restaurant to view payment information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <PaymentDashboard restaurantId={restaurantId} />;
}
