
import { supabase } from "../../integrations/supabase/client";
import { handleApiError } from "../utils";

/**
 * Restaurant location operations
 */
export const restaurantLocationApi = {
  getByLocationId: async (locationId: string) => {
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("restaurant_location_id", locationId)
        .order("reservation_date", { ascending: true });
      if (error) {
        console.error("Supabase error in getByLocationId:", error);
        return handleApiError(error);
      }
      return data;
    } catch (error) {
      console.error("Caught error in getByLocationId:", error);
      return handleApiError(error);
    }
  }
};
