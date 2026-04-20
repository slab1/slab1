
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  CalendarIcon, Users, Cake, Music, Utensils, Package, User, FileText, 
  CreditCard, ChevronRight, ChevronLeft, Sparkles, ArrowRight, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/api/types';
import { specialEventApi } from '@/api/specialEvent';
import { isApiError } from '@/api/utils';
import { EventStepIndicator } from './EventStepIndicator';
import { EventPackageCard, defaultPackages, EventPackage } from './EventPackageCard';


interface SpecialEventBookingProps {
  restaurantId: string;
  restaurant?: Restaurant | null;
  className?: string;
}

const eventTypes = [
  { value: 'birthday', label: '🎂 Birthday Celebration', icon: '🎂' },
  { value: 'anniversary', label: '💍 Anniversary', icon: '💍' },
  { value: 'corporate', label: '💼 Corporate Event', icon: '💼' },
  { value: 'wedding', label: '💒 Wedding Reception', icon: '💒' },
  { value: 'graduation', label: '🎓 Graduation Party', icon: '🎓' },
  { value: 'holiday', label: '🎄 Holiday Party', icon: '🎄' },
  { value: 'other', label: '✨ Other Special Occasion', icon: '✨' },
];

const steps = [
  { label: 'Event Type', icon: <Sparkles className="h-5 w-5" /> },
  { label: 'Package', icon: <Package className="h-5 w-5" /> },
  { label: 'Details', icon: <FileText className="h-5 w-5" /> },
  { label: 'Contact', icon: <User className="h-5 w-5" /> },
  { label: 'Review', icon: <CreditCard className="h-5 w-5" /> },
];

export function SpecialEventBooking({ restaurantId, restaurant, className }: SpecialEventBookingProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [eventDate, setEventDate] = useState<Date>();
  const [eventTime, setEventTime] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');
  const [guestCount, setGuestCount] = useState<string>('20');
  const [locationId, setLocationId] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);
  
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [eventDetails, setEventDetails] = useState<string>('');
  const [dietaryRequirements, setDietaryRequirements] = useState<string>('');
  const [addOnServices, setAddOnServices] = useState({
    privateSpace: false,
    customMenu: false,
    audioVisual: false,
    decorations: false,
    entertainment: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Set default location
  useEffect(() => {
    if (restaurant?.locations && restaurant.locations.length > 0 && !locationId) {
      setLocationId(restaurant.locations[0].id);
    }
  }, [restaurant, locationId]);

  // Auto-fill user info
  useEffect(() => {
    if (user) {
      setContactName(user.name || '');
      setContactEmail(user.email || '');
    }
  }, [user]);

  // Dynamic time slots
  const timeSlots = useMemo(() => {
    if (!restaurant) return ['17:00', '18:00', '19:00', '20:00', '21:00'];
    
    let openingHours = restaurant.opening_hours;
    if (typeof openingHours === 'string') {
      try { openingHours = JSON.parse(openingHours); } catch { return ['17:00', '18:00', '19:00', '20:00', '21:00']; }
    }
    if (!openingHours || typeof openingHours !== 'object') return ['17:00', '18:00', '19:00', '20:00', '21:00'];

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = eventDate ? dayNames[eventDate.getDay()] : 'monday';
    const hours = (openingHours as Record<string, any>)[dayName];

    if (!hours || hours.closed || !hours.open || !hours.close) return ['17:00', '18:00', '19:00', '20:00', '21:00'];

    const [openH] = String(hours.open).split(':').map(Number);
    const [closeH] = String(hours.close).split(':').map(Number);

    const times = [];
    for (let h = openH; h < closeH; h++) {
      times.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return times.length > 0 ? times : ['17:00', '18:00', '19:00', '20:00', '21:00'];
  }, [restaurant, eventDate]);

  useEffect(() => {
    if (timeSlots.length > 0 && (!eventTime || !timeSlots.includes(eventTime))) {
      setEventTime(timeSlots[0]);
    }
  }, [timeSlots, eventTime]);

  // Price scaling based on restaurant
  const priceMultiplier = useMemo(() => {
    if (!restaurant?.price) return 1;
    const map: Record<string, number> = { '$': 0.6, '$$': 1, '$$$': 1.6, '$$$$': 2.5 };
    return map[restaurant.price] || 1;
  }, [restaurant]);

  const scaledPackages = useMemo(() => {
    return defaultPackages.map(pkg => ({
      ...pkg,
      pricePerPerson: Math.round(pkg.pricePerPerson * priceMultiplier),
    }));
  }, [priceMultiplier]);

  // Compute final services = package services + add-ons
  const finalServices = useMemo(() => {
    const pkgServices = selectedPackage?.services || {
      privateSpace: false, customMenu: false, audioVisual: false, decorations: false, entertainment: false,
    };
    return {
      privateSpace: pkgServices.privateSpace || addOnServices.privateSpace,
      customMenu: pkgServices.customMenu || addOnServices.customMenu,
      audioVisual: pkgServices.audioVisual || addOnServices.audioVisual,
      decorations: pkgServices.decorations || addOnServices.decorations,
      entertainment: pkgServices.entertainment || addOnServices.entertainment,
    };
  }, [selectedPackage, addOnServices]);

  // Price calculation
  const totalEstimate = useMemo(() => {
    if (!selectedPackage) return 0;
    let total = selectedPackage.pricePerPerson * parseInt(guestCount);
    
    // Add-on costs (only services not included in package)
    const addOnPrices = { privateSpace: 250, customMenu: 300, audioVisual: 150, decorations: 200, entertainment: 350 };
    Object.entries(addOnServices).forEach(([key, enabled]) => {
      if (enabled && !selectedPackage.services[key as keyof typeof selectedPackage.services]) {
        total += addOnPrices[key as keyof typeof addOnPrices] * priceMultiplier;
      }
    });

    // Event type multiplier
    if (eventType === 'wedding') total *= 1.3;
    if (eventType === 'corporate') total *= 1.1;
    
    return Math.round(total);
  }, [selectedPackage, guestCount, addOnServices, eventType, priceMultiplier]);

  const depositAmount = Math.round(totalEstimate * 0.2);

  // Restore state from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(`special_event_state_${restaurantId}`);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.eventDate) setEventDate(new Date(s.eventDate));
        if (s.eventTime) setEventTime(s.eventTime);
        if (s.eventType) setEventType(s.eventType);
        if (s.guestCount) setGuestCount(s.guestCount);
        if (s.contactName) setContactName(s.contactName);
        if (s.contactEmail) setContactEmail(s.contactEmail);
        if (s.contactPhone) setContactPhone(s.contactPhone);
        if (s.eventDetails) setEventDetails(s.eventDetails);
        if (s.dietaryRequirements) setDietaryRequirements(s.dietaryRequirements);
        if (s.currentStep) setCurrentStep(s.currentStep);
        if (user) sessionStorage.removeItem(`special_event_state_${restaurantId}`);
      } catch {}
    }
  }, [restaurantId, user]);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 0: return !!eventType && !!guestCount;
      case 1: return !!selectedPackage;
      case 2: return !!eventDate && !!eventTime;
      case 3: return !!contactName && !!contactEmail && !!contactPhone;
      case 4: return true;
      default: return false;
    }
  }, [currentStep, eventType, guestCount, selectedPackage, eventDate, eventTime, contactName, contactEmail, contactPhone]);

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      sessionStorage.setItem(`special_event_state_${restaurantId}`, JSON.stringify({
        eventDate: eventDate?.toISOString(), eventTime, eventType, guestCount,
        contactName, contactEmail, contactPhone, eventDetails, dietaryRequirements, currentStep,
      }));
      toast.error('Please login to book a special event');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (!eventDate) { toast.error('Please select an event date'); return; }

    try {
      setIsSubmitting(true);
      const result = await specialEventApi.create({
  restaurant_id: restaurantId,
  location_id: locationId || null,
  user_id: user.id,
  event_type: eventType,
  event_date: format(eventDate, 'yyyy-MM-dd'),
  event_time: eventTime,
  guest_count: parseInt(guestCount),
  contact_name: contactName,
  contact_email: contactEmail,
  contact_phone: contactPhone,
  event_details: `[${selectedPackage?.name} Package] ${eventDetails}`,
  dietary_requirements: dietaryRequirements,
  special_services: finalServices,
  deposit_amount: depositAmount,
  quote_estimate: totalEstimate,
  status: 'pending',
  payment_status: 'unpaid',
});

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      toast.success('Event request submitted successfully!');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error booking special event:', error);
      toast.error('Failed to submit event request');
      setIsSubmitting(false);
    }
  };

  const handlePaymentCompleted = async () => {
    try {
      const { data } = await supabase.from('special_events')
        .select('id').eq('user_id', user?.id).eq('restaurant_id', restaurantId)
        .eq('status', 'pending').order('created_at', { ascending: false }).limit(1).single();
      if (data) {
        await supabase.from('special_events').update({ status: 'confirmed' }).eq('id', data.id);
      }
      toast.success('Special event request submitted!', {
        description: 'Our events team will contact you within 24 hours.',
      });
      navigate('/booking-confirmed');
    } catch {
      toast.success('Special event request submitted!');
      navigate('/booking-confirmed');
    }
  };

  const addOnOptions = [
    { key: 'privateSpace', label: 'Private dining space', price: Math.round(250 * priceMultiplier) },
    { key: 'customMenu', label: 'Custom menu options', price: Math.round(300 * priceMultiplier) },
    { key: 'audioVisual', label: 'A/V equipment (projector, mic)', price: Math.round(150 * priceMultiplier) },
    { key: 'decorations', label: 'Decoration services', price: Math.round(200 * priceMultiplier) },
    { key: 'entertainment', label: 'Entertainment coordination', price: Math.round(350 * priceMultiplier) },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">What's the occasion?</h3>
              <p className="text-sm text-muted-foreground mb-4">Select your event type and expected party size</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {eventTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md',
                    eventType === type.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40'
                  )}
                  onClick={() => setEventType(type.value)}
                >
                  <span className="text-2xl block mb-2">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label.replace(/^[^\s]+ /, '')}</span>
                </button>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label className="text-base font-medium">Number of Guests</Label>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 30, 50, 75, 100, 150, 200].map(count => (
                  <button
                    key={count}
                    type="button"
                    className={cn(
                      'px-4 py-2 rounded-full border text-sm font-medium transition-all',
                      guestCount === String(count)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/40'
                    )}
                    onClick={() => setGuestCount(String(count))}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {restaurant?.locations && restaurant.locations.length > 1 && (
              <div className="space-y-2">
                <Label>Preferred Location</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {restaurant.locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {typeof loc.address === 'string' ? loc.address : (loc.address as any)?.city || loc.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Choose your package</h3>
              <p className="text-sm text-muted-foreground mb-4">Select a package that fits your vision. Add extras in the next step.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scaledPackages.map((pkg) => (
                <EventPackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={selectedPackage?.id === pkg.id}
                  onSelect={(p) => {
                    setSelectedPackage(p);
                    // Reset add-ons that are already included
                    setAddOnServices(prev => {
                      const next = { ...prev };
                      Object.keys(p.services).forEach(key => {
                        if (p.services[key as keyof typeof p.services]) {
                          next[key as keyof typeof next] = false;
                        }
                      });
                      return next;
                    });
                  }}
                  guestCount={parseInt(guestCount)}
                />
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Event details</h3>
              <p className="text-sm text-muted-foreground mb-4">Set the date, time, and any special requirements</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-medium">Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-11">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventDate ? format(eventDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={eventDate}
                      onSelect={(date) => { setEventDate(date); }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label className="font-medium">Start Time</Label>
                <Select value={eventTime} onValueChange={setEventTime}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Event Description</Label>
              <Textarea
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                placeholder="Tell us about your vision for this event..."
                rows={3}
                maxLength={2000}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Dietary Requirements</Label>
              <Textarea
                value={dietaryRequirements}
                onChange={(e) => setDietaryRequirements(e.target.value)}
                placeholder="Any dietary restrictions or allergies we should know about"
                rows={2}
                maxLength={1000}
              />
            </div>

            <div className="space-y-3">
              <Label className="font-medium">Add-On Services</Label>
              <p className="text-xs text-muted-foreground -mt-1">Enhance your {selectedPackage?.name} package with extras</p>
              <div className="space-y-2">
                {addOnOptions.map(({ key, label, price }) => {
                  const includedInPackage = selectedPackage?.services[key as keyof typeof selectedPackage.services];
                  return (
                    <div key={key} className={cn(
                      'flex items-center justify-between p-3 rounded-lg border transition-colors',
                      includedInPackage && 'bg-primary/5 border-primary/20',
                    )}>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={key}
                          checked={includedInPackage || addOnServices[key as keyof typeof addOnServices]}
                          disabled={includedInPackage}
                          onCheckedChange={(checked) =>
                            setAddOnServices(prev => ({ ...prev, [key]: checked === true }))
                          }
                        />
                        <Label htmlFor={key} className="cursor-pointer text-sm">{label}</Label>
                      </div>
                      {includedInPackage ? (
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">INCLUDED</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">+${price}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Contact information</h3>
              <p className="text-sm text-muted-foreground mb-4">How can our events team reach you?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Full Name</Label>
                <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-phone">Phone Number</Label>
                <Input id="contact-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 (555) 000-0000" required />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Review your event</h3>
              <p className="text-sm text-muted-foreground mb-4">Confirm everything looks good before submitting</p>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="p-5 bg-muted/30 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{eventTypes.find(t => t.value === eventType)?.icon}</span>
                      <h4 className="font-bold text-lg">{eventTypes.find(t => t.value === eventType)?.label.replace(/^[^\s]+ /, '')}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">at {restaurant?.name || 'Restaurant'}</p>
                  </div>
                  <Badge className="text-sm">{selectedPackage?.name}</Badge>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Date</span>
                    <p className="font-semibold mt-0.5">{eventDate ? format(eventDate, 'EEEE, MMM d, yyyy') : '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Time</span>
                    <p className="font-semibold mt-0.5">{eventTime}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Guests</span>
                    <p className="font-semibold mt-0.5">{guestCount} people</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Contact</span>
                    <p className="font-semibold mt-0.5">{contactName}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Services Included</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(finalServices).map(([key, val]) => val && (
                      <Badge key={key} variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>

                {eventDetails && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Event Notes</span>
                      <p className="text-sm mt-1 italic text-muted-foreground">"{eventDetails}"</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="bg-muted/50 -mx-5 -mb-5 p-5 rounded-b-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Estimated Total</span>
                    <span className="text-2xl font-bold">${totalEstimate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Deposit (20%)</span>
                    <span className="font-semibold text-foreground">${depositAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Final pricing confirmed after consultation. Deposit secures your date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card className="border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-2xl">Plan Your Special Event</CardTitle>
          </div>
          <CardDescription>Create an unforgettable experience at {restaurant?.name || 'our venue'}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <EventStepIndicator steps={steps} currentStep={currentStep} />
          
          <div className="min-h-[400px]">
            {renderStep()}
          </div>
          
          <div className="flex justify-between items-center pt-6 mt-6 border-t">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && 'invisible')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              {totalEstimate > 0 && currentStep > 0 && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Est. Total</p>
                  <p className="text-lg font-bold">${totalEstimate.toLocaleString()}</p>
                </div>
              )}

              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={!canProceed()} size="lg">
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  {isSubmitting ? 'Processing...' : `Submit & Pay $${depositAmount} Deposit`}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showPaymentModal && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentCompleted}
          amount={depositAmount}
          restaurantName={restaurant?.name || "Special Event Booking"}
        />
      )}
    </div>
  );
}
