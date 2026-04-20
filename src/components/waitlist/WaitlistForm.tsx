
import { useState } from "react";
import { waitlistApi, WaitlistEntry } from "@/api/waitlist";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

interface WaitlistFormProps {
  restaurantId: string;
  onSubmitSuccess?: (entry: WaitlistEntry) => void;
}

export const WaitlistForm = ({ restaurantId, onSubmitSuccess }: WaitlistFormProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [quotedWitTime, setQuotedWaitTime] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const resetForm = () => {
    setName("");
    setPhone("");
    setPartySize("");
    setSpecialRequests("");
    setQuotedWaitTime(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !partySize) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create entry with required fields matching WaitlistEntry interface
      const waitlistEntry: any = {
        restaurant_id: restaurantId,
        party_size: parseInt(partySize),
        phone_number: phone,
        notes: specialRequests || undefined,
        quoted_wait_time: quotedWitTime ? parseInt(quotedWitTime) : undefined,
        status: "waiting" as const
      };
      
      // Only add user_id if user is authenticated
      if (user) {
        waitlistEntry.user_id = user.id;
      }
      
      const result = await waitlistApi.create(waitlistEntry);
      
      if (result) {
        toast.success("You've been added to the waitlist!");
        resetForm();
        if (onSubmitSuccess) {
          onSubmitSuccess(result);
        }
      }
    } catch (error) {
      console.error("Error joining waitlist:", error);
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your Phone Number"
          required
        />
      </div>
      <div>
        <Label htmlFor="partySize">Party Size</Label>
        <Input
          type="number"
          id="partySize"
          value={partySize}
          onChange={(e) => setPartySize(e.target.value)}
          placeholder="Number of Guests"
          min="1"
          required
        />
      </div>
      <div>
        <Label htmlFor="specialRequests">Special Requests</Label>
        <Textarea
          id="specialRequests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Any special requests?"
        />
      </div>
      <div>
        <Label htmlFor="quotedWitTime">Estimated Wait Time (minutes)</Label>
        <Input
          type="number"
          id="quotedWitTime"
          value={quotedWitTime}
          onChange={(e) => setQuotedWaitTime(e.target.value)}
          placeholder="Quoted Wait Time"
          min="0"
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Joining Waitlist..." : "Join Waitlist"}
      </Button>
    </form>
  );
};
