import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import restaurantApi from "@/api/restaurant";
import { Restaurant } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Trash, Plus, Image, CheckCircle, XCircle } from "lucide-react";
import { RestaurantForm } from "./RestaurantForm";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { useUpload } from "@/hooks/use-upload";

export function RestaurantsTable() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [imageUploadDialog, setImageUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const { user } = useAuth();

  const { upload, replace, isUploading: uploading } = useUpload({
    bucket: 'restaurant-images',
    compress: true
  });

  const { 
    data: restaurants, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["restaurants"],
    queryFn: restaurantApi.getAll
  });

  const canDeleteRestaurant = user?.role === 'superadmin';
  const canCreateRestaurant = user?.role === 'superadmin';
  const canEditRestaurant = user?.role === 'superadmin' || 
                           user?.role === 'system_admin' || 
                           user?.role === 'restaurant_owner';

  const handleEdit = (restaurant: Restaurant) => {
    if (canEditRestaurant) {
      setEditingRestaurant(restaurant);
      setIsFormOpen(true);
    } else {
      toast.error("You don't have permission to edit restaurants");
    }
  };

  const handleDeleteClick = (restaurant: Restaurant) => {
    if (canDeleteRestaurant) {
      setRestaurantToDelete(restaurant);
      setShowDeleteDialog(true);
    } else {
      toast.error("Only superadmins can delete restaurants");
    }
  };

  const handleDelete = async () => {
    if (!restaurantToDelete) return;
    
    try {
      await restaurantApi.delete(restaurantToDelete.id);
      toast.success("Restaurant deleted successfully");
      refetch();
      setShowDeleteDialog(false);
      setRestaurantToDelete(null);
      setDeleteReason("");
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      toast.error("Failed to delete restaurant");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRestaurant(null);
  };

  const handleFormSubmit = async () => {
    await refetch();
    handleFormClose();
  };

  const handleStatusUpdate = async (restaurantId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await restaurantApi.update(restaurantId, { 
        status: newStatus,
        is_active: newStatus === 'approved'
      });
      toast.success(`Restaurant ${newStatus} successfully`);
      refetch();
    } catch (error) {
      console.error(`Error updating restaurant status:`, error);
      toast.error(`Failed to update restaurant status`);
    }
  };

  const handleImageClick = (restaurant: Restaurant) => {
    if (canEditRestaurant) {
      setCurrentRestaurant(restaurant);
      setImageUploadDialog(true);
    } else {
      toast.error("You don't have permission to manage restaurant images");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !currentRestaurant) return;
    
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${currentRestaurant.id}.${fileExt}`;
      const filePath = `restaurants/${fileName}`;
      
      const publicUrl = await replace(selectedFile, currentRestaurant.image_url, filePath);
      
      if (publicUrl) {
        await restaurantApi.update(currentRestaurant.id, {
          image_url: publicUrl
        });
        
        toast.success("Restaurant image updated successfully");
        refetch();
        setImageUploadDialog(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const filteredRestaurants = (restaurants as Restaurant[] || [])?.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.description && restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || restaurant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  if (error) {
    return <div>Error loading restaurants: {(error as Error).message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Restaurants</h2>
        {canCreateRestaurant && (
          <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Restaurant
          </Button>
        )}
      </div>

      {isFormOpen && (
        <RestaurantForm 
          restaurant={editingRestaurant} 
          onClose={handleFormClose} 
          onSubmit={handleFormSubmit} 
        />
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search restaurants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
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
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="hidden md:table-cell min-w-[200px]">Description</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Locations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No restaurants found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      {restaurant.image_url ? (
                        <div className="w-12 h-12 relative rounded overflow-hidden">
                          <OptimizedImage 
                            src={restaurant.image_url} 
                            alt={restaurant.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-muted flex items-center justify-center rounded">
                          <Image className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{restaurant.name}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                      {restaurant.description || "No description"}
                    </TableCell>
                    <TableCell>{getStatusBadge(restaurant.status)}</TableCell>
                    <TableCell>{restaurant.locations?.length || 0} locations</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {user?.role === 'superadmin' && restaurant.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleStatusUpdate(restaurant.id, 'approved')}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleStatusUpdate(restaurant.id, 'rejected')}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {canEditRestaurant && (
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(restaurant)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canEditRestaurant && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleImageClick(restaurant)}
                            title="Manage Image"
                          >
                            <Image className="h-4 w-4" />
                          </Button>
                        )}
                        {canDeleteRestaurant && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(restaurant)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Restaurant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{restaurantToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-reason">Reason for deletion (required)</Label>
              <Textarea
                id="delete-reason"
                placeholder="Please provide a reason for deleting this restaurant"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={!deleteReason.trim()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={imageUploadDialog} onOpenChange={setImageUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Restaurant Image</DialogTitle>
            <DialogDescription>
              Upload a new image for {currentRestaurant?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant-image">Restaurant Image</Label>
              <Input
                id="restaurant-image"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
              />
              
              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm mb-2">Preview:</p>
                  <div className="relative w-full h-48 rounded overflow-hidden">
                    <OptimizedImage 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setImageUploadDialog(false);
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImageUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
