
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { chefBookingApi } from '@/api/chefBooking';
import { Chef } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin, Users, ChefHat, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useInputValidation } from '@/hooks/use-input-validation';
import { useInputSanitization } from '@/hooks/use-security';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface ChefBookingFormProps {
  chef: Chef;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ChefBookingForm({ chef, onCancel, onSuccess }: ChefBookingFormProps) {
  const { user } = useAuth();
  const { validateInput } = useInputValidation();
  const { sanitizeInput } = useInputSanitization();
  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '',
    duration: 4,
    guest_count: 4,
    location: '',
    special_requests: '',
    menu_description: ''
  });

  const totalAmount = (chef.hourly_rate || 0) * formData.duration;

  const createBookingMutation = useMutation({
  mutationFn: async (bookingData: typeof formData) => {
    // Check user exists BEFORE making request
    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }
    
    return await chefBookingApi.createBooking({
      chef_id: chef.id,
      booking_date: bookingData.booking_date,
      booking_time: bookingData.booking_time,
      duration: bookingData.duration,
      guest_count: bookingData.guest_count,
      location: sanitizeInput(bookingData.location),
      special_requests: sanitizeInput(bookingData.special_requests),
      menu_description: sanitizeInput(bookingData.menu_description),
      total_amount: totalAmount,
      user_id: user.id  // ✅ Pass user_id from already-authenticated context
    });
  },
  onSuccess: () => {
    toast.success('Chef booking created successfully!');
    onSuccess();
  },
  onError: (error) => {
    console.error('Chef booking error:', error);
    toast.error('Failed to create booking: ' + error.message);
  }
});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to book a chef');
      return;
    }

    // Validate required fields
    if (!formData.booking_date || !formData.booking_time || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate inputs for security
    const validationRules = {
      location: { required: true, minLength: 5, maxLength: 200, noScripts: true },
      special_requests: { maxLength: 1000, noScripts: true },
      menu_description: { maxLength: 1000, noScripts: true }
    };

    const locationValidation = validateInput(formData.location, validationRules.location);
    if (!locationValidation.isValid) {
      toast.error('Please enter a valid location address');
      return;
    }

    // Validate date is in the future
    const bookingDateTime = new Date(`${formData.booking_date}T${formData.booking_time}`);
    if (bookingDateTime <= new Date()) {
      toast.error('Booking date and time must be in the future');
      return;
    }

    createBookingMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chef Info */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Chef Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <OptimizedImage
              src={chef.image || '/placeholder.svg'}
              alt={chef.name}
              className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
            />
            <h3 className="font-semibold text-lg">{chef.name}</h3>
            <p className="text-muted-foreground">{chef.specialty}</p>
            <p className="text-sm text-muted-foreground">{chef.location}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Experience:</span>
              <span className="text-sm">{chef.years_experience} years</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Hourly Rate:</span>
              <span className="text-sm font-semibold">${chef.hourly_rate}/hour</span>
            </div>
          </div>

          {chef.signature_dishes && chef.signature_dishes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Signature Dishes:</h4>
              <div className="space-y-1">
                {chef.signature_dishes.slice(0, 3).map((dish, index) => (
                  <p key={index} className="text-sm text-muted-foreground">• {dish}</p>
                ))}
              </div>
            </div>
          )}

          {chef.bio && (
            <div>
              <h4 className="font-medium mb-2">About:</h4>
              <p className="text-sm text-muted-foreground line-clamp-4">{chef.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Book Chef {chef.name}</CardTitle>
          <CardDescription>
            Fill in the details for your chef booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="booking_date" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Booking Date *
                </Label>
                <Input
                  id="booking_date"
                  type="date"
                  min={minDate}
                  value={formData.booking_date}
                  onChange={(e) => handleInputChange('booking_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="booking_time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time *
                </Label>
                <Input
                  id="booking_time"
                  type="time"
                  value={formData.booking_time}
                  onChange={(e) => handleInputChange('booking_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration (hours)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="2"
                  max="12"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 4)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="guest_count" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of Guests
                </Label>
                <Input
                  id="guest_count"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.guest_count}
                  onChange={(e) => handleInputChange('guest_count', parseInt(e.target.value) || 4)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Event Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter the full address where the chef will cook"
                required
              />
            </div>

            <div>
              <Label htmlFor="menu_description">Menu Preferences</Label>
              <Textarea
                id="menu_description"
                value={formData.menu_description}
                onChange={(e) => handleInputChange('menu_description', e.target.value)}
                placeholder="Describe your preferred menu, dietary restrictions, cuisine style, etc."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="special_requests">Special Requests</Label>
              <Textarea
                id="special_requests"
                value={formData.special_requests}
                onChange={(e) => handleInputChange('special_requests', e.target.value)}
                placeholder="Any special requirements, allergies, equipment needs, etc."
                rows={3}
              />
            </div>

            {/* Cost Summary */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Cost Breakdown
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Hourly Rate:</span>
                    <span>${chef.hourly_rate}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{formData.duration} hours</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total Amount:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={createBookingMutation.isPending}
                className="flex-1"
              >
                {createBookingMutation.isPending ? 'Creating Booking...' : 'Book Chef'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
