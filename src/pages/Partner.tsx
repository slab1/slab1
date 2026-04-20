
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { paymentApi } from "@/api/payment";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Coffee, Store, Users } from "lucide-react";

const partnerFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone_number: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

export default function Partner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const form = useForm<z.infer<typeof partnerFormSchema>>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      businessName: "",
      email: user?.email || "",
      phone_number: "",
      description: "",
    },
  });

  const handlePayment = async (amount: number, planName: string) => {
    if (!user) {
      toast.error("Please log in to continue");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const metadata = {
        userId: user.id,
        planName: planName,
      };

      const { clientSecret, paymentIntentId } = await paymentApi.createPaymentIntent(amount, "usd", metadata);
      
      if (clientSecret) {
        // In a real app, you would redirect to a payment page or open a Stripe modal
        toast.success(`Payment intent created for ${planName} plan. In a real app, this would redirect to Stripe.`);
        
        // Simulate payment completion (in a real app, this would happen after Stripe redirect)
        setTimeout(async () => {
          await paymentApi.completePayment(paymentIntentId);
          toast.success("Partnership application submitted successfully!");
          setSelectedPlan(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("There was a problem processing your payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (values: z.infer<typeof partnerFormSchema>) => {
    if (!selectedPlan) {
      toast.error("Please select a partnership plan");
      return;
    }

    const planPrices = {
      "basic": 99,
      "premium": 299,
      "enterprise": 999
    };

    const planName = selectedPlan as keyof typeof planPrices;
    handlePayment(planPrices[planName], planName);
  };

  return (
    <div className="container max-w-6xl py-10 space-y-10">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Partner With Us</h1>
        <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Join our network of restaurant partners and grow your business
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle>Basic Partnership</CardTitle>
            <CardDescription>For small restaurants getting started</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Basic listing placement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Online reservation system</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Customer analytics dashboard</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant={selectedPlan === "basic" ? "default" : "outline"} 
              className="w-full"
              onClick={() => setSelectedPlan("basic")}
            >
              {selectedPlan === "basic" ? "Selected" : "Select Plan"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-2 border-primary shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Premium Partnership</CardTitle>
              <Badge>Popular</Badge>
            </div>
            <CardDescription>For established restaurants</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$299</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Premium listing placement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Advanced reservation management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Marketing integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>24/7 priority support</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant={selectedPlan === "premium" ? "default" : "outline"} 
              className="w-full"
              onClick={() => setSelectedPlan("premium")}
            >
              {selectedPlan === "premium" ? "Selected" : "Select Plan"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle>Enterprise Partnership</CardTitle>
            <CardDescription>For restaurant chains & groups</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$999</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>All Premium features</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Multi-location management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Custom integrations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Dedicated account manager</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>API access</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant={selectedPlan === "enterprise" ? "default" : "outline"} 
              className="w-full"
              onClick={() => setSelectedPlan("enterprise")}
            >
              {selectedPlan === "enterprise" ? "Selected" : "Select Plan"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Apply to become a partner</h2>
            <p className="text-muted-foreground">
              Fill out the form below to start your partnership application.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Restaurant Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@yourrestaurant.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your restaurant..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include cuisine type, location, and what makes your restaurant special.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Processing..." : "Submit Application"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Why partner with us?</h2>
            <p className="text-muted-foreground">
              Join thousands of restaurants that have grown their business with our platform.
            </p>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Expand Your Reach</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with thousands of potential customers looking for dining experiences.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Streamline Operations</h3>
                    <p className="text-sm text-muted-foreground">
                      Our reservation system makes table management effortless.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Coffee className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Increase Revenue</h3>
                    <p className="text-sm text-muted-foreground">
                      Our partners see an average 30% increase in bookings in the first 3 months.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
