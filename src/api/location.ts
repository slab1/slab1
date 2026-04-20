import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./utils";
import { RestaurantLocation, Json, RestaurantLocationAddress } from "./types";

// Helper function to get restaurant contact info for authorized users
export const getRestaurantContactInfo = async (locationId: string) => {
  try {
    const { data, error } = await supabase
      .rpc("get_restaurant_contact_info", { location_id: locationId });

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return null;
  }
};

export const locationApi = {
  getAll: async (
    page = 1,
    limit = 10,
    filters = {},
    sortBy = "created_at",
    order = "asc"
  ) => {
    try {
      const { data: locations, error } = await supabase
        .rpc("get_public_restaurant_locations");

      if (error) throw error;

      let filtered = (locations || []) as unknown as RestaurantLocation[];
      
      filtered.sort((a, b) => {
        const aVal = a[sortBy as keyof RestaurantLocation];
        const bVal = b[sortBy as keyof RestaurantLocation];
        if (aVal === undefined || bVal === undefined) return 0;
        if (order === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      const start = (page - 1) * limit;
      const end = start + limit;
      filtered = filtered.slice(start, end);

      return filtered as unknown as RestaurantLocation[];
    } catch (error) {
      return handleApiError(error);
    }
  },

  getByRestaurant: async (restaurant_id: string) => {
    try {
      const { data: publicLocations, error } = await supabase
        .rpc("get_public_restaurant_locations");

      if (error) throw error;

      const filteredLocations = (publicLocations || []).filter(
        (location: any) => location.restaurant_id === restaurant_id
      ) as unknown as RestaurantLocation[];

      return filteredLocations as unknown as RestaurantLocation[];
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .rpc("get_restaurant_location_details", { location_id: id });

      if (error) throw error;
      
      const location = data?.[0];
      if (!location) {
        throw new Error("Location not found");
      }

      return location as unknown as RestaurantLocation;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (locationData: Partial<RestaurantLocation>) => {
    try {
      const streetValue = typeof locationData.address === 'object' 
        ? (locationData.address as RestaurantLocationAddress)?.street || '' 
        : String(locationData.address ?? '');
      
      const addressJson = {
        street: streetValue,
        city: locationData.city ?? "",
        state: locationData.state ?? "",
        zip: locationData.zip ?? ""
      };

      const contactInfoJson = {
        phone_number: locationData.phone_number ?? "",
        email: locationData.email ?? ""
      };

      const { data, error } = await supabase
        .from("restaurant_locations")
        .insert([{
          address: addressJson as unknown as Json,
          contact_info: contactInfoJson as unknown as Json,
          phone_number: locationData.phone_number ?? "",
          restaurant_id: locationData.restaurant_id ?? "",
        }])
        .select()
        .single();

      if (error) throw error;
      return data as unknown as RestaurantLocation;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (id: string, locationData: Partial<RestaurantLocation>) => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (locationData.address || locationData.city || locationData.state || locationData.zip) {
        updateData.address = {
          street: typeof locationData.address === 'string' ? locationData.address : (locationData.address as RestaurantLocationAddress)?.street,
          city: locationData.city,
          state: locationData.state,
          zip: locationData.zip
        };
      }
      
      if (locationData.phone_number || locationData.email) {
        updateData.contact_info = {
          phone_number: locationData.phone_number,
          email: locationData.email
        };
        if (locationData.phone_number) {
          updateData.phone_number = locationData.phone_number;
        }
      }

      const { error } = await supabase
        .from("restaurant_locations")
        .update(updateData)
        .eq("id", id);
        
      if (error) throw error;
      
      const { data, error: getError } = await supabase
        .from("restaurant_locations")
        .select("*")
        .eq("id", id)
        .single();
        
      if (getError) throw getError;
      
      return data as unknown as RestaurantLocation;
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from("restaurant_locations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
