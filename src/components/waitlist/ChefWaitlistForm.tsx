import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ClockIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const waitlistFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  partySize: z.string().refine((val) => !isNaN(Number(val)), { message: "Party size must be a number." }),
  date: z.string().min(1, { message: "Please select a date." }),
  specialRequests: z.string().optional(),
});

type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;

interface ChefWaitlistFormProps {
  chefId: string;
  chefName: string;
  onSuccess?: () => void;
}

export function ChefWaitlistForm({ chefId, chefName, onSuccess }: ChefWaitlistFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null);

  const getUserName = () => {
    if (user?.name) return user.name;
    // Don't try to access first_name and last_name as they don't exist on our UserType
    return "";
  };

  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      name: getUserName(),
      phone: "",
      partySize: "2",
      date: "",
      specialRequests: "",
    },
  });

  async function onSubmit(data: WaitlistFormValues) {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would save to the database
      // Here we're just simulating it with a random wait time
      const waitTime = Math.floor(Math.random() * 30) + 15; // Random wait time between 15-45 minutes
      setEstimatedWait(waitTime);
      
      toast.success(`You've been added to ${chefName}'s waitlist!`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error joining waitlist:", error);
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request {chefName}'s Services</CardTitle>
        <CardDescription>
          Join our waitlist to be notified when this chef is available for booking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {estimatedWait ? (
          <div className="text-center py-4 space-y-4">
            <ClockIcon className="h-12 w-12 text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-medium">You're on the waitlist!</h3>
              <p className="text-muted-foreground">We'll contact you as soon as possible.</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p>We'll text you at {form.getValues("phone")} with more details.</p>
            </div>
            <Button variant="outline" className="mt-4" onClick={() => setEstimatedWait(null)}>
              Request Another Chef
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll text you when the chef is available.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select party size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size} {size === 1 ? "person" : "people"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Input placeholder="Any special requirements?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting Request..." : "Request Chef"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 flex-col items-start text-xs text-muted-foreground">
        <p>Please note that chef availability may vary based on demand.</p>
        <p className="mt-1">By submitting this form, you agree to receive SMS notifications.</p>
      </CardFooter>
    </Card>
  );
}
