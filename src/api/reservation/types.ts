
import { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { Reservation, ReservationInput } from "../types";

export type { Reservation, ReservationInput };
export type ReservationUpdateCallback = (payload: RealtimePostgresUpdatePayload<Reservation>) => void;
