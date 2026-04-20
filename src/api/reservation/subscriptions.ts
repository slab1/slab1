
import { supabase } from "@/integrations/supabase/client";
import { ReservationUpdateCallback } from "./types";

export const subscribeToReservationStatusChanges = (callback: ReservationUpdateCallback) => {
  const channel = supabase
    .channel("reservation_status_changes")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "reservations",
        filter: "status=eq.confirmed",
      },
      callback
    )
    .subscribe();

  return channel;
};
