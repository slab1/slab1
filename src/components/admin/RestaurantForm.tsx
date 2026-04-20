import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import restaurantApi from "@/api/restaurant";
import { Restaurant } from "@/api/types";
import { Textarea } from "@/components/ui/textarea";
import { RestaurantGallery } from "./RestaurantGallery";
import { Image, Upload, Info, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ensureStorageBuckets } from "@/integrations/supabase/setupStorage";
import { CUISINE_TYPES, DEFAULT_OPERATING_HOURS } from "@/api/restaurant/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useUpload } from "@/hooks/use-upload";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const restaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  description: z.string().optional(),
  cuisine: z.string().min(1, "Cuisine type is required"),
  price: z.string().default("$$"),
  rating: z.string().default("4.0"),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  is_active: z.boolean().default(true),
  image_url: z.string().optional(),
});

type RestaurantFormValues = z.infer<typeof restaurantSchema>;

interface RestaurantFormProps {
  restaurant?: Restaurant | null;
  onClose: () => void;
  onSubmit: () => void;
}

export function RestaurantForm({ restaurant, onClose, onSubmit }: RestaurantFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGallery, setShowGallery] = useState(false);
  
  const { upload, replace, isUploading: uploading } = useUpload({
    bucket: 'restaurant-images',
    compress: true
  });

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant?.name || "",
      description: restaurant?.description || "",
      cuisine: restaurant?.cuisine || "",
      price: restaurant?.price || "$$",
      rating: restaurant?.rating?.toString() || "4.0",
      status: restaurant?.status || 'pending',
      is_active: restaurant?.is_active ?? true,
      image_url: restaurant?.image_url || "",
    }
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    ensureStorageBuckets();
  }, []);

  const canManageGallery = user && (user.role === 'restaurant_manager' || user.role === 'system_admin' || user.role === 'superadmin');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const oldUrl = form.getValues("image_url");
        const publicUrl = await replace(file, oldUrl);
        if (publicUrl) {
          form.setValue("image_url", publicUrl);
        }
      } catch (error) {
        // Error toast is already shown by useUpload
      }
    }
  };
  
  const onFormSubmit = async (values: RestaurantFormValues) => {
    try {
      const adminId = restaurant?.admin_id || (user?.id || "");

      // Build a type-safe object for the API
      const restaurantData: Record<string, unknown> = {
        name: values.name.trim(),
        cuisine: values.cuisine,
        price: values.price,
        status: values.status,
        is_active: values.is_active,
        rating: parseFloat(values.rating) || 4.0,
        description: values.description?.trim() || "Great dining experience awaits you",
        image_url: values.image_url || "/placeholder.svg",
        admin_id: adminId,
        features: Array.isArray(restaurant?.features) ? restaurant?.features.join(',') : (restaurant?.features || ""),
        opening_hours: restaurant?.opening_hours || DEFAULT_OPERATING_HOURS
      };

      if (restaurant) {
        await restaurantApi.update(restaurant.id, restaurantData as any);
        toast.success("Restaurant updated successfully");
      } else {
        await restaurantApi.create(restaurantData as any);
        toast.success("Restaurant created successfully");
      }
      onSubmit();
    } catch (error) {
      console.error("Error saving restaurant:", error);
      toast.error("Failed to save restaurant");
    }
  };

  if (showGallery && restaurant) {
    return <RestaurantGallery restaurantId={restaurant.id} onClose={() => setShowGallery(false)} />;
  }

  const imageUrl = form.watch("image_url");

  return (
    <Card className="w-full max-w-2xl mx-auto my-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{restaurant ? "Edit Restaurant" : "Add New Restaurant"}</CardTitle>
        {restaurant && canManageGallery && (
          <Button 
            variant="outline" 
            onClick={() => setShowGallery(true)}
            className="flex items-center gap-2"
          >
            <Image className="h-4 w-4" />
            Manage Gallery
          </Button>
        )}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter restaurant name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cuisine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuisine Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cuisine" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CUISINE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="$">$ - Budget friendly</SelectItem>
                        <SelectItem value="$$">$$ - Moderate</SelectItem>
                        <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                        <SelectItem value="$$$$">$$$$ - Fine dining</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="5" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Status</FormLabel>
                    <Select 
                      onValueChange={(val) => {
                        field.onChange(val);
                        if (val === 'approved') form.setValue('is_active', true);
                        else if (val === 'rejected') form.setValue('is_active', false);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Is Active
                      </FormLabel>
                      <FormDescription>
                        Visible to public
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your restaurant..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Restaurant Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                  {imageUrl ? (
                    <OptimizedImage 
                      src={imageUrl} 
                      alt="Restaurant preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {imageUrl ? "Change Image" : "Upload Image"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1200 x 800 px
                  </p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {restaurant ? "Update Restaurant" : "Create Restaurant"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
