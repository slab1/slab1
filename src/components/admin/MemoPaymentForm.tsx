
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  CreditCard as CreditCardIcon, 
  DollarSign, 
  FileText,
  Receipt,
  Store
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { restaurantApi } from "@/api/restaurant";
import { restaurantPaymentApi } from "@/api/restaurant/payment";
import { Restaurant } from "@/api/types";
import { StripePaymentForm } from "../payment/StripePaymentForm";

export function MemoPaymentForm() {
  const [amount, setAmount] = useState("10.00");
  const [description, setDescription] = useState("");
  const [memo, setMemo] = useState("");
  const [paymentType, setPaymentType] = useState("demoPayment");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("stripe");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [activeTab, setActiveTab] = useState("create");
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantApi.getAll();
        setRestaurants(data);
        if (data.length > 0) {
          setSelectedRestaurantId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };
    fetchRestaurants();
  }, []);

  // Check if user has permission to create payments - allow all admin and staff roles
  const canCreatePayments = user?.role === 'system_admin' || user?.role === 'superadmin' || user?.role === 'restaurant_manager' || user?.role === 'restaurant_staff';

  const handleCreatePayment = async () => {
    if (!canCreatePayments) {
      toast.error("You don't have permission to create payments");
      return;
    }

    if (!selectedRestaurantId) {
      toast.error("Please select a restaurant");
      return;
    }

    try {
      setIsLoading(true);
      
      // Parse amount to make sure it's a valid number
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      let result;
      if (paymentType === 'demoPayment') {
        result = await restaurantPaymentApi.createDemoPayment(selectedRestaurantId, numericAmount, description || "Demo payment");
      } else if (paymentType === 'memoPayment') {
        result = await restaurantPaymentApi.createMemoPayment(selectedRestaurantId, numericAmount, description || "Memo payment", memo);
      } else {
        // Reservation payment - simplified for this form
        toast.info("For reservation payments, please use the reservation form.");
        return;
      }

      if (result && result.clientSecret) {
        setClientSecret(result.clientSecret);
        toast.success("Payment intent created successfully. Please complete the payment.");
      } else {
        toast.error("Failed to create payment intent");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error(`Failed to create ${paymentType === "memoPayment" ? "memo" : "demo"} payment`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setIsSuccess(true);
    setClientSecret(null);
    
    const receiptData = {
      amount: parseFloat(amount),
      description: description || "Demo payment",
      memo: memo || "",
      payment_type: paymentType,
      payment_provider: paymentProvider,
      payment_method: paymentMethod,
      transaction_id: paymentData.paymentIntent.id,
      date: new Date().toISOString(),
      status: "successful",
      customer: user?.name || "Customer",
      customer_email: user?.email || "customer@example.com",
    };

    setGeneratedReceipt(receiptData);
    setPaymentUrl(`#/payment-success?id=${receiptData.transaction_id}`);
    toast.success("Payment successful!");
    
    // Reset form after success
    setTimeout(() => {
      setDescription("");
      setMemo("");
      setAmount("10.00");
    }, 2000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-4">
      <CardHeader>
        <CardTitle>Payment Administration</CardTitle>
        <CardDescription>
          Create test payments, receipts, and verify payment processing functionality.
          For demo purposes only - no actual charges will be processed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="create">Create Payment</TabsTrigger>
            <TabsTrigger value="receipts">Generate Receipt</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant">Restaurant</Label>
              <Select 
                value={selectedRestaurantId} 
                onValueChange={setSelectedRestaurantId} 
                disabled={isLoading || !canCreatePayments || restaurants.length === 0}
              >
                <SelectTrigger id="restaurant">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    <SelectValue placeholder="Select restaurant" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentProvider">Payment Provider</Label>
              <Select 
                value={paymentProvider} 
                onValueChange={setPaymentProvider} 
                disabled={isLoading || !canCreatePayments}
              >
                <SelectTrigger id="paymentProvider">
                  <SelectValue placeholder="Select payment provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paystack">Paystack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select 
                value={paymentType} 
                onValueChange={setPaymentType} 
                disabled={isLoading || !canCreatePayments}
              >
                <SelectTrigger id="paymentType">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demoPayment">Demo Payment</SelectItem>
                  <SelectItem value="memoPayment">Memo Payment</SelectItem>
                  <SelectItem value="reservationPayment">Reservation Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select 
                value={paymentMethod} 
                onValueChange={setPaymentMethod} 
                disabled={isLoading || !canCreatePayments}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="ussd">USSD</SelectItem>
                  {paymentProvider === "paystack" && (
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({paymentProvider === "paystack" ? "NGN" : "USD"})</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter amount in ${paymentProvider === "paystack" ? "Naira" : "USD"}`}
                type="number"
                min="0.01"
                step="0.01"
                disabled={isLoading || !canCreatePayments}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter payment description"
                rows={2}
                disabled={isLoading || !canCreatePayments}
              />
            </div>
            
            {paymentType === "memoPayment" && (
              <div className="space-y-2">
                <Label htmlFor="memo">Memo</Label>
                <Textarea
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Enter additional memo information"
                  rows={3}
                  disabled={isLoading || !canCreatePayments}
                />
              </div>
            )}
            
            {isSuccess && (
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <h3 className="font-medium text-green-700 mb-2">Payment Completed Successfully</h3>
                <p className="text-sm text-green-600 mb-2">
                  Your {paymentType === "memoPayment" ? "memo" : "demo"} payment has been processed.
                </p>
                <div className="border border-green-100 rounded-md p-3 bg-green-50 text-green-800 text-sm mt-2 font-mono">
                  <p>Transaction ID: {generatedReceipt?.transaction_id}</p>
                  <p>Amount: {paymentProvider === "paystack" ? "₦" : "$"}{generatedReceipt?.amount}</p>
                  <p>Date: {new Date(generatedReceipt?.date).toLocaleString()}</p>
                  <p>Status: {generatedReceipt?.status}</p>
                </div>
                {paymentUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab("receipts")}
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    View Receipt
                  </Button>
                )}
              </div>
            )}

            {clientSecret && !isSuccess && (
              <div className="mt-6 border rounded-md p-4 bg-muted/30">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <CreditCardIcon className="h-4 w-4" />
                  Complete Payment
                </h3>
                <StripePaymentForm 
                  amount={parseFloat(amount)}
                  restaurantId={selectedRestaurantId}
                  reservationId={`ADMIN-${Date.now()}`}
                  description={description || `${paymentType === "memoPayment" ? "Memo" : "Demo"} payment`}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={(err) => console.error("Payment error:", err)}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="receipts" className="space-y-4">
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center text-lg">
                  <Receipt className="mr-2 h-5 w-5" /> 
                  Receipt Generator
                </CardTitle>
                <CardDescription>Generate and view receipts for demo payments</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {generatedReceipt ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold">Payment Receipt</h2>
                        <p className="text-muted-foreground">Demo Transaction</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Date:</p>
                        <p>{new Date(generatedReceipt.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-b py-4 my-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Transaction ID</p>
                          <p className="font-mono">{generatedReceipt.transaction_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="inline-flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                            {generatedReceipt.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Provider</p>
                          <p className="capitalize">{generatedReceipt.payment_provider}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Method</p>
                          <p className="capitalize">{generatedReceipt.payment_method}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Customer</p>
                          <p>{generatedReceipt.customer}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p>{generatedReceipt.customer_email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p>{generatedReceipt.description}</p>
                      {generatedReceipt.memo && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">Memo</p>
                          <p className="text-sm">{generatedReceipt.memo}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center border-t pt-4">
                      <p className="font-medium">Total Amount</p>
                      <p className="text-xl font-bold">
                        {generatedReceipt.payment_provider === "paystack" ? "₦" : "$"}
                        {generatedReceipt.amount.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex justify-end mt-6 gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                      <Button size="sm">
                        <Receipt className="mr-2 h-4 w-4" />
                        Print Receipt
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-lg">
                    <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-2">No Receipt Generated</h3>
                    <p className="text-muted-foreground mb-4">
                      Create a demo payment first to generate a receipt.
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab("create")}>
                      Create Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View all demo transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedReceipt ? (
                  <div className="border rounded-md divide-y">
                    <div className="p-4 flex items-center justify-between hover:bg-muted/50">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          {generatedReceipt.payment_method === 'card' ? (
                            <CreditCardIcon className="h-5 w-5 text-primary" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{generatedReceipt.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(generatedReceipt.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {generatedReceipt.payment_provider === "paystack" ? "₦" : "$"}
                          {generatedReceipt.amount.toFixed(2)}
                        </p>
                        <p className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded inline-block">
                          {generatedReceipt.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No transaction history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {activeTab === "create" && !clientSecret && !isSuccess && (
          <Button 
            onClick={handleCreatePayment} 
            disabled={isLoading || !canCreatePayments}
            className="w-full"
          >
            {isLoading ? "Initializing..." : `Initialize ${paymentType === "memoPayment" ? "Memo" : "Demo"} Payment`}
          </Button>
        )}
        {clientSecret && !isSuccess && (
          <Button 
            variant="ghost" 
            onClick={() => setClientSecret(null)} 
            className="w-full"
          >
            Cancel and Reset
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
