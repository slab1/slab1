import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePartnerSubscription } from "@/hooks/use-partner-subscription";
import { userRoleApi } from "@/api/userRole";
import { handleApiError } from "@/api/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, MapPin, Clock, Users, Star, Info, Plus, AlertCircle } from "lucide-react";
import { CUISINE_TYPES, FEATURE_OPTIONS, DAYS_OF_WEEK, DayOfWeek, DEFAULT_OPERATING_HOURS, COUNTRIES } from "@/api/restaurant/constants";
import { ImageUpload } from "@/components/ui/image-upload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type RestaurantRegistrationFormProps = {
  onSuccess: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
};

const locationSchema = z.object({
  locationName: z.string().min(2, "Location name is required (e.g. Main, Downtown)"),
  country: z.string().min(2, "Country is required"),
  address: z.string().min(5, "Please provide a complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  phone_number: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, "Please enter a valid phone number"),
  email: z.string().email("Valid email is required"),
  website: z.string().optional().or(z.literal("")).transform(val => {
    if (!val) return val;
    // Allow domain names without protocol
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      return `https://${val}`;
    }
    return val;
  }).pipe(z.string().refine(
    (val) => {
      if (!val) return true; // Allow empty
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid website (e.g., www.example.com or https://example.com)", path: [] }
  ).optional().or(z.literal(""))),
  operatingHours: z.object({
    monday: z.object({ open: z.string(), close: z.string(), closed: z.boolean().optional() }),
    tuesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean().optional() }),
    wednesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean().optional() }),
    thursday: z.object({ open: z.string(), close: z.string(), closed: z.boolean().optional() }),
    friday: z.object({ open: z.string(), close: z.string(), closed: z.boolean().optional() }),
    saturday: z.object({ open: z.string(), close: z.string(), closed: z.boolean().optional() }),
    sunday: z.object({ open: z.string(), close: z.string(), closed: z.boolean().optional() }),
  }),
});

const registrationSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters"),
  imageUrl: z.string().optional().or(z.literal("")),
  cuisine: z.string().min(1, "Please select a cuisine type"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1").max(1000, "Capacity cannot exceed 1000"),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]),
  features: z.array(z.string()).min(1, "Please select at least one feature"),
  locations: z.array(locationSchema).min(1, "At least one location is required"),
  marketingOptIn: z.boolean(),
  termsAccepted: z.boolean().refine(val => val, "You must accept the terms and conditions"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;
type LocationFormData = z.infer<typeof locationSchema>;

// Subcomponent for rendering all fields for a single location
function LocationFields({ idx, form }: {
  idx: number;
  form: ReturnType<typeof useForm<RegistrationFormData>>;
}) {
  const applyToAllDays = () => {
    const mondayHours = form.getValues(`locations.${idx}.operatingHours.monday`);
    DAYS_OF_WEEK.forEach((day) => {
      if (day !== "monday") {
        form.setValue(`locations.${idx}.operatingHours.${day}` as const, { ...mondayHours } as any);
      }
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`locations.${idx}.locationName` as const}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="flex items-center gap-2">
                Location Name
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>e.g. Main Branch, Downtown, North Side</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Main Location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`locations.${idx}.country` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`locations.${idx}.address` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main Street" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`locations.${idx}.city` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="London, Lagos, Toronto..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`locations.${idx}.state` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State / Province / Region (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. California, Ontario, Lagos..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`locations.${idx}.postalCode` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 10001, SW1A 1AA..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`locations.${idx}.phone_number` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`locations.${idx}.email` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="restaurant@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`locations.${idx}.website` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://www.yourrestaurant.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Operating Hours</h4>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={applyToAllDays}
            className="text-xs h-8"
          >
            Apply Monday to all days
          </Button>
        </div>
        {DAYS_OF_WEEK.map((day) => {
          const isClosed = !!form.watch(`locations.${idx}.operatingHours.${day}.closed` as const);
          return (
            <div key={day} className="grid grid-cols-4 gap-4 items-center mb-3">
              <label className="capitalize text-sm font-medium">{day}</label>
              <FormField
                control={form.control}
                name={`locations.${idx}.operatingHours.${day}.open` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={isClosed}
                        className={isClosed ? "opacity-50" : ""}
                        value={typeof field.value === "string" ? field.value : ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`locations.${idx}.operatingHours.${day}.close` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        disabled={isClosed}
                        className={isClosed ? "opacity-50" : ""}
                        value={typeof field.value === "string" ? field.value : ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`locations.${idx}.operatingHours.${day}.closed` as const}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <label className="text-sm">Closed</label>
                  </FormItem>
                )}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

export function RestaurantRegistrationForm({
  onSuccess,
  setLoading,
  setCurrentStep,
}: RestaurantRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStepLocal] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscription: partnerSubscription, loading: subscriptionLoading } = usePartnerSubscription();
  const [currentLocationsCount, setCurrentLocationsCount] = useState(0);
  const [partnerInfo, setPartnerInfo] = useState<any>(null);

  // Storage key for draft persistence
  const DRAFT_STORAGE_KEY = `restaurant_reg_draft_${user?.id || 'guest'}`;

  useEffect(() => {
    const fetchCurrentLocations = async () => {
      if (!user) return;
      const { count, error } = await (supabase
        .from('restaurant_locations') as any)
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);
      
      if (!error && count !== null) {
        setCurrentLocationsCount(count);
      }
    };

    fetchCurrentLocations();
  }, [user]);

  useEffect(() => {
    const fetchPartnerInfo = async () => {
      if (!user) return;
      
      const { data, error } = await (supabase
        .from('restaurant_partners') as any)
        .select(`
          *,
          subscription_plans (
            id,
            name,
            features,
            max_locations
          )
        `)
        .eq('user_id', user.id)
        .single();
      
      if (data && !error) {
        setPartnerInfo(data);
      }
    };

    fetchPartnerInfo();
  }, [user]);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      restaurantName: "",
      imageUrl: "",
      cuisine: "",
      description: "",
      capacity: 50,
      priceRange: "$$",
      features: [],
      marketingOptIn: true,
      termsAccepted: false,
      locations: [
        {
          locationName: "Main Location",
          country: "US",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          phone_number: "",
          email: "",
          website: "",
          operatingHours: DEFAULT_OPERATING_HOURS,
        },
      ],
    },
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        // We only restore if it's within a reasonable timeframe (e.g., 24 hours) or just always restore
        form.reset(parsedDraft.data);
        if (parsedDraft.step) {
          setCurrentStepLocal(parsedDraft.step);
          setCurrentStep(parsedDraft.step);
        }
      } catch (e) {
        console.warn("Failed to restore registration draft:", e);
      }
    }
  }, [user, form, setCurrentStep, DRAFT_STORAGE_KEY]);

  // Save draft on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        data: value,
        step: currentStep,
        updatedAt: new Date().toISOString()
      }));
    });
    return () => subscription.unsubscribe();
  }, [form, currentStep, DRAFT_STORAGE_KEY]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "locations",
  });

  const onSubmit = async (data: RegistrationFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register your restaurant.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    try {
      // Check location limits
      const totalRequestedLocations = data.locations.length;
      const totalProjectedLocations = currentLocationsCount + totalRequestedLocations;
      const maxAllowedLocations = (partnerSubscription as any)?.maxLocations || (partnerSubscription as any)?.max_locations;

      if (maxAllowedLocations !== undefined && maxAllowedLocations !== null && totalProjectedLocations > maxAllowedLocations) {
        throw new Error(`Plan limit reached: Your current plan allows a maximum of ${maxAllowedLocations} locations. You currently have ${currentLocationsCount} and are trying to add ${totalRequestedLocations} more.`);
      }

      // Create restaurant
      const baseSlug = data.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Use the first location as the primary contact info for the restaurant
      const primaryLoc = data.locations[0];
      
      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .insert({
          name: data.restaurantName,
          cuisine: data.cuisine,
          cuisine_type: data.cuisine,
          cuisine_type_raw: [data.cuisine],
          description: data.description,
          price: data.priceRange,
          features: data.features.join(','),
          capacity: data.capacity,
          seating_capacity: data.capacity,
          image_url: data.imageUrl || null,
          admin_id: user.id,
          slug: slug,
          is_active: false,
          status: 'pending',
          phone: primaryLoc.phone_number,
          email: primaryLoc.email,
          website: primaryLoc.website,
          country_code: primaryLoc.country,
          address: primaryLoc.address,
          plan_id: partnerInfo?.subscription_plan_id || null,
          subscription_plan: partnerInfo?.subscription_plan_id || null,
          plan_features: partnerInfo?.subscription_plans?.features || null,
        })
        .select()
        .single();

      if (restaurantError) {
        console.error("Restaurant creation error:", restaurantError);
        throw new Error(`Failed to create restaurant: ${restaurantError.message}`);
      }

      // Insert locations
      const locationData = data.locations.map((loc, index) => ({
        restaurant_id: restaurant.id,
        location_name: loc.locationName,
        country: loc.country,
        address: { 
          street: loc.address, 
          city: loc.city, 
          state: loc.state, 
          zip: loc.postalCode,
          country: loc.country 
        },
        city: loc.city,
        state: loc.state,
        zip: loc.postalCode,
        phone_number: loc.phone_number,
        email: loc.email,
        website: loc.website,
        operating_hours: loc.operatingHours as any,
        is_main_location: index === 0,
        is_primary: index === 0,
        owner_id: user.id,
      }));

      const { error: locationsError } = await supabase
        .from("restaurant_locations")
        .insert(locationData);

      if (locationsError) {
        console.error("Locations creation error:", locationsError);
        // Rollback: delete the created restaurant since its locations failed
        const { error: rollbackError } = await supabase
          .from("restaurants")
          .delete()
          .eq("id", restaurant.id);
        
        if (rollbackError) {
          console.error("Rollback failed:", rollbackError);
        }
        
        throw new Error(`Failed to create restaurant locations: ${locationsError.message}. Restaurant creation rolled back.`);
      }

      // Upgrade user role to restaurant_owner if they are currently a customer
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          // Get current role to avoid downgrading admins
          const currentRole = await userRoleApi.getByUserId(authData.user.id);
          
          // Map to UserRole type safely
          const roleValue = typeof currentRole === 'string' ? currentRole : (currentRole as any)?.role;
          
          // Only upgrade if they are a customer or have no role
          if (!roleValue || roleValue === 'customer') {
            console.log("Upgrading user to restaurant_owner role...");
            // Use the updateRole function which is more robust
            await userRoleApi.updateRole(authData.user.id, 'restaurant_owner', 'Upgraded after restaurant registration');
          }
        }
      } catch (roleError) {
        console.warn("Failed to update user role, but restaurant was created:", roleError);
        // Track the warning but don't stop the success flow
        handleApiError(roleError, {
          context: 'restaurant_registration_role_upgrade',
          showToast: false,
          additionalInfo: { userId: user.id, restaurantId: restaurant.id }
        });
      }

      // Add to marketing if opted in
      if (data.marketingOptIn) {
        const { error: marketingError } = await supabase
          .from("marketing_subscribers")
          .upsert({ 
            email: user.email, 
            source: "restaurant_registration",
            restaurant_id: restaurant.id,
          });
        
        if (marketingError) {
          console.warn("Marketing subscription failed:", marketingError);
          // Don't throw here, as the restaurant was successfully created
        }
      }

      toast({
        title: "Registration Successful",
        description: "Your restaurant application has been submitted for review.",
      });
      
      // Clear draft on success
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      
      form.reset();
      setCurrentStepLocal(1);
      setCurrentStep(1);
      onSuccess?.();
    } catch (error: any) {
      handleApiError(error, {
        context: 'restaurant_registration',
        customMessage: "There was an error submitting your registration. Please try again.",
        additionalInfo: { 
          userId: user.id,
          restaurantName: data.restaurantName,
          step: currentStep
        }
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ["restaurantName", "cuisine", "description", "capacity", "priceRange"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["locations"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["features"];
    }

    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid) {
      const next = Math.min(currentStep + 1, 4);
      setCurrentStepLocal(next);
      setCurrentStep(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast({
        title: "Validation Error",
        description: "Please check the highlighted fields and try again.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    const prev = Math.max(currentStep - 1, 1);
    setCurrentStepLocal(prev);
    setCurrentStep(prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Register Your Restaurant
          </CardTitle>
          <CardDescription>
            Join our platform and start reaching more customers today
          </CardDescription>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded ${
                  step <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 space-y-2">
                      <FormLabel>Restaurant Image</FormLabel>
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ImageUpload
                                storageBucket="restaurant-images"
                                storagePath="restaurants"
                                onImageUrlChange={field.onChange}
                                initialImageUrl={field.value}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a high-quality photo of your restaurant or a representative dish.
                      </p>
                    </div>

                    <div className="flex-1 space-y-6">
                      <FormField
                        control={form.control}
                        name="restaurantName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Restaurant Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your restaurant name" {...field} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Textarea
                            placeholder="Tell us about your restaurant..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seating Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priceRange"
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
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location(s) & Contact
                  </h3>

                  {partnerSubscription?.maxLocations !== null && (
                    <Alert variant={currentLocationsCount + fields.length > (partnerSubscription?.maxLocations || 0) ? "destructive" : "default"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Location Limit Information</AlertTitle>
                      <AlertDescription>
                        Your current plan ({partnerSubscription?.planName}) allows up to {partnerSubscription?.maxLocations} locations. 
                        You already have {currentLocationsCount} location(s). 
                        You are adding {fields.length} more. 
                        {currentLocationsCount + fields.length > (partnerSubscription?.maxLocations || 0) && (
                          <span className="font-bold block mt-1">
                            Warning: You have exceeded your plan limit. Please upgrade or remove locations.
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-8">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="border rounded-lg p-4 relative bg-muted/30">
                        <div className="absolute top-2 right-2">
                          {fields.length > 1 && (
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => remove(idx)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <LocationFields idx={idx} form={form} />
                      </div>
                    ))}
                  </div>
                  
                  {partnerSubscription?.maxLocations !== null && currentLocationsCount + fields.length >= (partnerSubscription?.maxLocations || 0) ? (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-800">
                      <Info className="h-5 w-5" />
                      <p className="text-sm">
                        You've reached the maximum number of locations ({partnerSubscription?.maxLocations}) allowed for your <strong>{partnerSubscription?.planName}</strong> plan. 
                        You have {currentLocationsCount} existing locations and are adding {fields.length} more.
                        Upgrade your plan to add more locations.
                      </p>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-4"
                      onClick={() => append({
                        locationName: `Location ${fields.length + 1}`,
                        country: "US",
                        address: "",
                        city: "",
                        state: "",
                        postalCode: "",
                        phone_number: "",
                        email: "",
                        website: "",
                        operatingHours: DEFAULT_OPERATING_HOURS,
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Location
                    </Button>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Restaurant Features
                  </h3>
                  <FormField
                    control={form.control}
                    name="features"
                    render={() => (
                      <FormItem>
                        <FormLabel>Restaurant Features</FormLabel>
                        <div className="grid grid-cols-3 gap-4">
                          {FEATURE_OPTIONS.map((feature) => (
                            <FormField
                              key={feature}
                              control={form.control}
                              name="features"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(feature)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, feature])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== feature)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <label className="text-sm">{feature}</label>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Final Steps
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border border-dashed">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Restaurant Info</h4>
                      <p className="font-medium">{form.getValues("restaurantName")}</p>
                      <p className="text-sm">{form.getValues("cuisine")} • {form.getValues("priceRange")}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{form.getValues("description")}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Locations</h4>
                      <p className="text-sm font-medium">{form.getValues("locations").length} Location(s)</p>
                      <p className="text-sm text-muted-foreground">
                        {form.getValues("locations")[0].city}, {form.getValues("locations")[0].country}
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="marketingOptIn"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Subscribe to marketing updates
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Receive tips, promotions, and updates to help grow your business
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the terms and conditions
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            By registering, you agree to our terms of service and privacy policy
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">What happens next?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• We'll review your application within 24-48 hours</li>
                      <li>• You'll receive an email confirmation once approved</li>
                      <li>• Access to your restaurant dashboard will be granted</li>
                      <li>• Start managing reservations and building your online presence</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="ml-auto">
                    {isSubmitting ? "Registering..." : "Register Restaurant"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
