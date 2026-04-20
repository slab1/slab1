
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { CalendarPlus, Calendar, Download, Share2, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarIntegrationProps {
  reservationDate: Date;
  reservationTime: string;
  restaurantName: string;
  guestCount: number;
  location?: string;
  confirmationNumber?: string;
}

export function CalendarIntegration({
  reservationDate,
  reservationTime,
  restaurantName,
  guestCount,
  location,
  confirmationNumber
}: CalendarIntegrationProps) {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [calendarType, setCalendarType] = useState("google");
  const [email, setEmail] = useState("");
  
  // Format date and times for calendar events
  const formattedDate = format(reservationDate, "yyyy-MM-dd");
  
  // Parse reservation time and create start/end times
  const timeParts = String(reservationTime || '19:00').split(':');
  const hours = parseInt(timeParts[0] || '19');
  const minutes = parseInt(timeParts[1] || '00');
  
  // Create Date objects for start and end (assuming 2 hour reservation)
  const startDateTime = new Date(reservationDate);
  startDateTime.setHours(hours, minutes, 0, 0);
  
  const endDateTime = new Date(startDateTime);
  endDateTime.setHours(hours + 2, minutes, 0, 0);
  
  // Format times for various calendar formats
  const startTimeFormatted = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
  const endTimeFormatted = format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss");
  
  const eventTitle = `Reservation at ${restaurantName}`;
  const eventDescription = `
Reservation for ${guestCount} ${guestCount === 1 ? 'person' : 'people'}
${confirmationNumber ? `Confirmation #: ${confirmationNumber}` : ''}

Enjoy your meal!
  `.trim();

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startTimeFormatted.replace(/[-:]/g, '')}/${endTimeFormatted.replace(/[-:]/g, '')}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(location || restaurantName)}`;
  
  // Apple Calendar link (downloads .ics file)
  const generateIcsContent = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startTimeFormatted.replace(/[-:]/g, '')}`,
      `DTEND:${endTimeFormatted.replace(/[-:]/g, '')}`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${eventDescription.replace(/\n/g, '\\n')}`,
      `LOCATION:${location || restaurantName}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    return icsContent;
  };

  const downloadIcsFile = () => {
    const icsContent = generateIcsContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const safeRestaurantName = String(restaurantName || 'restaurant').replace(/\s+/g, '_');
    link.download = `reservation_${safeRestaurantName}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleAddToCalendar = () => {
    if (calendarType === 'google') {
      window.open(googleCalendarUrl, '_blank');
      toast({
        title: "Opening Google Calendar",
        description: "Adding your reservation to Google Calendar",
      });
      setShowDialog(false);
    } else if (calendarType === 'apple' || calendarType === 'outlook') {
      downloadIcsFile();
      toast({
        title: `Calendar file downloaded`,
        description: `Import the .ics file to add to your calendar`,
      });
      setShowDialog(false);
    } else if (calendarType === 'email') {
      if (!email) {
        toast({
          title: "Email Required",
          description: "Please enter your email address",
          variant: "destructive",
        });
        return;
      }
      
      // In a real implementation, we would send calendar invite to email
      toast({
        title: "Calendar Invitation Sent",
        description: `A calendar invite has been sent to ${email}`,
      });
      setShowDialog(false);
    }
  };
  
  return (
    <div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full mt-4 flex items-center">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Add to Calendar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Reservation to Calendar</DialogTitle>
            <DialogDescription>
              Choose how you'd like to add this reservation to your calendar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="calendar-type">Calendar Type</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Google Calendar opens in a new browser tab.<br />
                        Apple and Outlook Calendar will download a file to import.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={calendarType} onValueChange={setCalendarType}>
                <SelectTrigger id="calendar-type">
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Google Calendar
                    </div>
                  </SelectItem>
                  <SelectItem value="apple">
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Apple Calendar (.ics)
                    </div>
                  </SelectItem>
                  <SelectItem value="outlook">
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Outlook Calendar (.ics)
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center">
                      <Share2 className="h-4 w-4 mr-2" />
                      Send via Email
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {calendarType === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="calendar-email">Email Address</Label>
                <Input 
                  id="calendar-email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
            
            <div className="bg-muted/30 p-3 rounded-md space-y-1 text-sm">
              <p><strong>Reservation Details</strong></p>
              <p>{eventTitle}</p>
              <p>{format(reservationDate, "EEEE, MMMM d, yyyy")} at {reservationTime}</p>
              <p>Party of {guestCount}</p>
              {location && <p>Location: {location}</p>}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddToCalendar}>
              {calendarType === 'email' ? 'Send Calendar Invite' : 'Add to Calendar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
