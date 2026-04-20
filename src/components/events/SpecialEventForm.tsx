import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";

import { specialEventApi } from "@/api/specialEvent";

const specialEventSchema = z.object({
  eventType: z.string().min(1, { message: "Please select an event type" }),
  eventDate: z.date(),
  eventTime: z.string().min(1, { message: "Please select a time" }),
  guestCount: z.string().min(1, { message: "Please select the number of guests" }),
  specialRequests: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  contact: z.object({
    name: z.string().min(2, { message: "Please enter your name" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    phone_number: z.string().min(10, { message: "Please enter a valid phone number" }),
  }),
});

type SpecialEventFormValues = z.infer<typeof specialEventSchema>;

interface SpecialEventFormProps {
  restaurantId: string;
  locationId?: string;
}

export function SpecialEventForm({ restaurantId, locationId }: SpecialEventFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SpecialEventFormValues>({
    resolver: zodResolver(specialEventSchema),
    defaultValues: {
      eventType: "",
      eventDate: new Date(),
      eventTime: "18:00",
      guestCount: "",
      specialRequests: "",
      dietaryRequirements: "",
      contact: {
        name: user ? user.email.split('@')[0] : "",
        email: user?.email || "",
        phone_number: "",
      },
    },
  });

  async function onSubmit(data: SpecialEventFormValues) {
    setIsSubmitting(true);
    try {
      const eventData = {
        restaurant_id: restaurantId,
        location_id: locationId,
        user_id: user?.id,
        event_type: data.eventType,
        event_date: format(data.eventDate, "yyyy-MM-dd"),
        event_time: data.eventTime,
        guest_count: parseInt(data.guestCount.split('-')[0]) || 10,
        event_details: data.specialRequests,
        dietary_requirements: data.dietaryRequirements,
        contact_name: data.contact.name,
        contact_email: data.contact.email,
        contact_phone: data.contact.phone_number,
        status: "pending" as const,
        deposit_amount: 0,
        payment_status: "unpaid" as const,
        special_services: {
          privateSpace: true,
          customMenu: false,
          audioVisual: false,
          decorations: false,
          entertainment: false
        }
      };

      const result = await specialEventApi.create(eventData);
      
      if (!result) throw new Error("Failed to create special event request");
      
      toast.success("Your special event request has been submitted!");
      form.reset();
    } catch (error) {
      console.error("Error submitting special event form:", error);
      toast.error("Failed to submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Book a Special Event</CardTitle>
        <CardDescription>
          Fill out this form to book a private dining experience, celebration, or corporate event.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="private_dining">Private Dining</SelectItem>
                        <SelectItem value="wedding">Wedding Reception</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="birthday">Birthday Celebration</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      onSelect={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select guest count" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="10-20">10-20 guests</SelectItem>
                        <SelectItem value="21-50">21-50 guests</SelectItem>
                        <SelectItem value="51-100">51-100 guests</SelectItem>
                        <SelectItem value="100+">100+ guests</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about any specific requirements or preferences for your event."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="dietaryRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please list any allergies or dietary restrictions your guests may have."
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contact.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact.phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Event Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="bg-muted/50 flex-col items-start text-xs text-muted-foreground">
        <p>Our events team will contact you within 24 hours to discuss your request.</p>
        <p className="mt-1">Pricing depends on event type, date, and specific requirements.</p>
      </CardFooter>
    </Card>
  );
}
