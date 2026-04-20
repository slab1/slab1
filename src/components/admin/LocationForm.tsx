import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { locationApi } from "@/api/location";
import { Restaurant, RestaurantLocation, UserRole } from "@/api/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { roleApi } from "@/api/role";

interface LocationFormProps {
  location?: RestaurantLocation | null;
  restaurants: Restaurant[];
  onClose: () => void;
  onSubmit: () => void;
}

export function LocationForm({ location, restaurants, onClose, onSubmit }: LocationFormProps) {
  // Handle both string and JSONB address formats
  const initialAddress = typeof location?.address === 'object' 
    ? (location.address as any)?.street || '' 
    : String(location?.address || '');
  const initialCity = typeof location?.address === 'object' 
    ? (location.address as any)?.city || '' 
    : (location as any)?.city || '';
  const initialState = typeof location?.address === 'object' 
    ? (location.address as any)?.state || '' 
    : (location as any)?.state || '';
  const initialZip = typeof location?.address === 'object' 
    ? (location.address as any)?.zip || '' 
    : (location as any)?.zip || '';
  const initialPhone = typeof (location as any)?.contact_info === 'object'
    ? (location as any)?.contact_info?.phone_number || ''
    : location?.phone_number || '';
  const initialEmail = typeof (location as any)?.contact_info === 'object'
    ? (location as any)?.contact_info?.email || ''
    : location?.email || '';
    
  const [restaurantId, setRestaurantId] = useState(location?.restaurant_id || "");
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [zip, setZip] = useState(initialZip);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const canManageAnyRestaurant = user?.role ? roleApi.hasPermission(user.role as UserRole, 'system_admin') : false;

  // Filter restaurants based on user role and permissions
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Superadmins and system admins can manage all restaurants
    if (user?.role === 'superadmin' || user?.role === 'system_admin') return true;
    
    // Restaurant managers and owners can only manage their assigned restaurants
    if ((user?.role === 'restaurant_manager' || user?.role === 'restaurant_owner') && restaurant.admin_id === user.id) return true;
    
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantId) {
      toast.error("Please select a restaurant");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const locationData = {
        restaurant_id: restaurantId,
        address,
        city,
        state,
        zip,
        phone_number: phoneNumber,
        email
      };

      if (location) {
        // Update existing location
        await locationApi.update(location.id, locationData);
        toast.success("Location updated successfully");
      } else {
        // Create new location
        await locationApi.create(locationData);
        toast.success("Location created successfully");
      }
      onSubmit();
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user doesn't have permission to manage any restaurant, show message
  if (filteredRestaurants.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto my-4">
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">
            You don't have permission to manage locations for any restaurants.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={onClose}>
            Return
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-4">
      <CardHeader>
        <CardTitle>{location ? "Edit Location" : "Add New Location"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant">Restaurant</Label>
            <Select 
              value={restaurantId} 
              onValueChange={setRestaurantId}
              disabled={!!location} // Disable changing restaurant if editing existing location
            >
              <SelectTrigger id="restaurant">
                <SelectValue placeholder="Select a restaurant" />
              </SelectTrigger>
              <SelectContent>
                {filteredRestaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter street address"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter state"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="Enter ZIP code"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : location ? "Update Location" : "Create Location"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
