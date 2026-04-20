import { useState, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Restaurant } from "@/api/types";
import { useAuth } from "@/hooks/use-auth";
import restaurantApi from "@/api/restaurant";
import { monitoringApi } from "@/api/monitoring";
import { cn } from "@/lib/utils";
import { Check, Loader2, Info, Globe, AlertCircle, Clock } from "lucide-react";
import { CUISINE_TYPES, FEATURE_OPTIONS, DEFAULT_OPERATING_HOURS } from "@/api/restaurant/constants";
import { OperatingHoursEditor } from "./OperatingHoursEditor";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageUpload } from "@/components/ui/image-upload";
import { RestaurantValidationSummary } from "@/components/validation/RestaurantValidationSummary";
import { performFullValidation } from "@/lib/validation/restaurantDataQuality";

const restaurantFormSchema = z.object({
  name: z.string().min(2, { message: "Restaurant name must be at least 2 characters." }),
  description: z.string().optional(),
  cuisine: z.string().min(1, { message: "Please select a cuisine type." }),
  price: z.string().min(1, { message: "Please select a price range." }),
  image_url: z.string().url({ message: "Please enter a valid URL for the image." }).optional().or(z.literal("")),
  features: z.array(z.string()).default([]),
  opening_hours: z.record(z.unknown()).optional(),
  languages: z.array(z.string()).default(['en']),
});

type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;

interface RestaurantProfileEditorProps {
  restaurant: Restaurant;
  onUpdate?: () => void;
}

export function RestaurantProfileEditor({ restaurant, onUpdate }: RestaurantProfileEditorProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Calculate validation results
  const validationResults = useMemo(() => {
    return performFullValidation(
      restaurant, 
      restaurant.locations || [], 
      [] // We'd need to fetch menu items separately for full validation
    );
  }, [restaurant]);

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: restaurant?.name || "",
      description: restaurant?.description || "",
      cuisine: restaurant?.cuisine || "",
      price: restaurant?.price || "",
      image_url: restaurant?.image_url || "",
      features: Array.isArray(restaurant?.features) 
        ? restaurant.features 
        : (typeof restaurant?.features === 'string' 
            ? restaurant.features.split(',').map(f => f.trim()).filter(Boolean)
            : []),
      opening_hours: (restaurant?.opening_hours as Record<string, unknown>) || DEFAULT_OPERATING_HOURS,
      languages: ['en'], // Default to English
    },
  });

  async function onSubmit(data: RestaurantFormValues) {
    if (!user) {
      toast.error("You need to be logged in to update your restaurant");
      return;
    }

    setIsSubmitting(true);

    try {
      await restaurantApi.update(restaurant.id, {
        name: data.name,
        description: data.description || null,
        cuisine: data.cuisine,
        price: data.price,
        image_url: data.image_url || null,
        features: data.features.join(','),
        opening_hours: data.opening_hours as any,
      });

      // Log the modification
      await monitoringApi.logAction({
        target_id: restaurant.id,
        target_type: 'restaurant',
        action: 'update',
        performed_by: user.id,
        severity: 'info',
        new_data: data
      });

      toast.success("Restaurant updated successfully");
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating restaurant:", error);
      toast.error("Failed to update restaurant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Function to handle auto-save of individual fields
  const handleAutoSave = async <K extends keyof RestaurantFormValues>(field: K, value: RestaurantFormValues[K]) => {
    if (!user || !restaurant) return;
    
    // Don't auto-save if value hasn't changed
    const currentValue = restaurant[field as keyof Restaurant];
    if (JSON.stringify(currentValue) === JSON.stringify(value)) return;

    setIsSaving(true);
    
    try {
      await restaurantApi.update(restaurant.id, { [field]: value });
      
      // Log the modification
      await monitoringApi.logAction({
        target_id: restaurant.id,
        target_type: 'restaurant',
        action: 'update',
        performed_by: user.id,
        severity: 'info',
        new_data: { [field]: value }
      });

      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} updated`);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Restaurant Profile</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowValidation(!showValidation)}
          className={cn(validationResults.overallScore < 80 ? "text-amber-500 border-amber-500 hover:bg-amber-50" : "")}
        >
          {showValidation ? "Hide Quality Check" : "Check Data Quality"}
          {validationResults.overallScore < 100 && (
            <AlertCircle className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>

      {showValidation && (
        <RestaurantValidationSummary results={validationResults} className="mb-6" />
      )}

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3">
                    <FormLabel className="mb-2 block">Restaurant Photo</FormLabel>
                    <ImageUpload
                      storageBucket="restaurant-images"
                      storagePath={restaurant.id}
                      initialImageUrl={restaurant.image_url}
                      onImageUrlChange={(url) => {
                        form.setValue('image_url', url || '');
                        handleAutoSave('image_url', url);
                      }}
                      aspectRatio="video"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restaurant Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Enter restaurant name" 
                                {...field} 
                                onBlur={() => handleAutoSave("name", field.value)}
                              />
                              {isSaving && field.name === "name" && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
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
                          <FormLabel>Cuisine Type</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleAutoSave("cuisine", value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select cuisine type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CUISINE_TYPES.map((cuisine) => (
                                <SelectItem key={cuisine} value={cuisine}>
                                  {cuisine}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea 
                            placeholder="Describe your restaurant..." 
                            className="h-24" 
                            {...field} 
                            onBlur={() => handleAutoSave("description", field.value)}
                          />
                          {isSaving && field.name === "description" && (
                            <div className="absolute right-3 top-3">
                              <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        A brief description of your restaurant to attract customers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Range</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleAutoSave("price", value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select price range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="$">$ - Budget</SelectItem>
                            <SelectItem value="$$">$$ - Moderate</SelectItem>
                            <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                            <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Supported Languages</FormLabel>
                    <div className="flex flex-wrap gap-3 p-3 border rounded-md">
                      {['en', 'fr', 'es', 'de', 'it'].map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`lang-${lang}`}
                            checked={form.watch('languages').includes(lang)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('languages');
                              const next = checked 
                                ? [...current, lang]
                                : current.filter(l => l !== lang);
                              form.setValue('languages', next);
                              // In a real app, we'd save this to a restaurant_languages table
                            }}
                          />
                          <label htmlFor={`lang-${lang}`} className="text-sm uppercase font-medium">{lang}</label>
                        </div>
                      ))}
                    </div>
                    <FormDescription>Select languages your restaurant supports</FormDescription>
                  </FormItem>
                </div>

                <div className="space-y-4">
                  <FormLabel>Features & Amenities</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {FEATURE_OPTIONS.map((feature) => (
                      <FormField
                        key={feature}
                        control={form.control}
                        name="features"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(feature)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  const next = checked
                                    ? [...current, feature]
                                    : current.filter((value) => value !== feature);
                                  field.onChange(next);
                                  handleAutoSave("features", next);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {feature}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4 flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Operating Hours
                  </h4>
                  <FormField
                    control={form.control}
                    name="opening_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                        <OperatingHoursEditor 
                            value={field.value as any} 
                            onChange={(val) => {
                              field.onChange(val);
                              handleAutoSave("opening_hours", val);
                            }} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save All Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
