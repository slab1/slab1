
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { locationApi } from "@/api/location";
import restaurantApi from "@/api/restaurant";
import { Restaurant, RestaurantLocation } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, Trash, Plus, MapPin } from "lucide-react";
import { LocationForm } from "./LocationForm";

export function LocationsTable() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<RestaurantLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { 
    data: restaurants = [], 
    isLoading: isLoadingRestaurants 
  } = useQuery({
    queryKey: ["restaurants"],
    queryFn: restaurantApi.getAll
  });

  const { 
    data: locations = [], 
    isLoading: isLoadingLocations, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      // Get all restaurants
      const allRestaurants = await restaurantApi.getAll();
      
      // Get all locations from each restaurant
      const allLocations: RestaurantLocation[] = [];
      for (const restaurant of allRestaurants) {
        if (restaurant.locations) {
          for (const location of restaurant.locations) {
            // Add restaurant info to each location
            allLocations.push({
              ...location,
              restaurant
            });
          }
        }
      }
      
      return allLocations;
    }
  });

  const handleEdit = (location: RestaurantLocation) => {
    setEditingLocation(location);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await locationApi.delete(id);
        toast.success("Location deleted successfully");
        refetch();
      } catch (error) {
        console.error("Error deleting location:", error);
        toast.error("Failed to delete location");
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingLocation(null);
  };

  const handleFormSubmit = async () => {
    await refetch();
    handleFormClose();
  };

  const filteredLocations = locations.filter(location => {
    const addressStr = typeof location.address === 'object' 
      ? JSON.stringify(location.address) 
      : String(location.address || '');
    const cityStr = typeof location.address === 'object' 
      ? (location.address as any)?.city || '' 
      : (location as any).city || '';
    const stateStr = typeof location.address === 'object' 
      ? (location.address as any)?.state || '' 
      : (location as any).state || '';
    
    return addressStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cityStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stateStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const isLoading = isLoadingRestaurants || isLoadingLocations;

  if (error) {
    return <div>Error loading locations: {(error as Error).message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Restaurant Locations</h2>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {isFormOpen && (
        <LocationForm 
          location={editingLocation} 
          restaurants={restaurants as Restaurant[]}
          onClose={handleFormClose} 
          onSubmit={handleFormSubmit} 
        />
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Restaurant</TableHead>
                <TableHead className="min-w-[200px]">Address</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[100px]">City</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[80px]">State</TableHead>
                <TableHead className="hidden md:table-cell min-w-[120px]">Phone</TableHead>
                <TableHead className="text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No locations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location) => {
                  const address = location.address;
                  const displayAddress = typeof address === 'object' ? (address as any)?.street || '' : String(address || '');
                  const displayCity = typeof address === 'object' ? (address as any)?.city || '' : (location as any).city || '';
                  const displayState = typeof address === 'object' ? (address as any)?.state || '' : (location as any).state || '';
                  
                  return (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.restaurant?.name || "Restaurant"}</TableCell>
                    <TableCell>{displayAddress}</TableCell>
                    <TableCell className="hidden sm:table-cell">{displayCity}</TableCell>
                    <TableCell className="hidden lg:table-cell">{displayState}</TableCell>
                    <TableCell className="hidden md:table-cell">{location.phone_number}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(location)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(location.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
