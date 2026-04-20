-- Migration to relate reservations, reviews, waitlist, and staff schedules
-- Date: 2026-02-01

DO $$ 
BEGIN
    -- 1. ENHANCE RESERVATIONS TABLE
    -- Add staff_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'staff_id') THEN
        ALTER TABLE public.reservations ADD COLUMN staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- Add schedule_id if it doesn't exist (link to staff schedule)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'schedule_id') THEN
        ALTER TABLE public.reservations ADD COLUMN schedule_id UUID REFERENCES public.staff_schedules(id) ON DELETE SET NULL;
    END IF;

    -- Add audit timestamps if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'confirmed_at') THEN
        ALTER TABLE public.reservations ADD COLUMN confirmed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'cancelled_at') THEN
        ALTER TABLE public.reservations ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'seated_at') THEN
        ALTER TABLE public.reservations ADD COLUMN seated_at TIMESTAMPTZ;
    END IF;

    -- 2. ENHANCE REVIEWS TABLE
    -- Add reservation_id to link feedback to specific bookings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reservation_id') THEN
        ALTER TABLE public.reviews ADD COLUMN reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL;
    END IF;

    -- 3. ENHANCE WAITLIST_ENTRIES TABLE
    -- Add reservation_id to track waitlist to reservation conversion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waitlist' AND column_name = 'reservation_id') THEN
        ALTER TABLE public.waitlist ADD COLUMN reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL;
    END IF;

    -- 4. ENHANCE STAFF SCHEDULING TABLES
    -- Add restaurant_location_id to staff_schedules
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_schedules' AND column_name = 'restaurant_location_id') THEN
        ALTER TABLE public.staff_schedules ADD COLUMN restaurant_location_id UUID REFERENCES public.restaurant_locations(id) ON DELETE CASCADE;
    END IF;

    -- Add restaurant_location_id to shift_types
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shift_types' AND column_name = 'restaurant_location_id') THEN
        ALTER TABLE public.shift_types ADD COLUMN restaurant_location_id UUID REFERENCES public.restaurant_locations(id) ON DELETE CASCADE;
    END IF;

    -- Add restaurant_location_id to restaurant_staff
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_staff' AND column_name = 'restaurant_location_id') THEN
        ALTER TABLE public.restaurant_staff ADD COLUMN restaurant_location_id UUID REFERENCES public.restaurant_locations(id) ON DELETE SET NULL;
    END IF;

END $$;

-- 5. AUTOMATIC TIMESTAMPS FOR RESERVATION STATUS CHANGES
CREATE OR REPLACE FUNCTION public.update_reservation_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed')) THEN
        NEW.confirmed_at = now();
    ELSIF (NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled')) THEN
        NEW.cancelled_at = now();
    ELSIF (NEW.status = 'seated' AND (OLD.status IS NULL OR OLD.status != 'seated')) THEN
        NEW.seated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_reservation_timestamps ON public.reservations;
CREATE TRIGGER trg_update_reservation_timestamps
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_reservation_timestamps();

-- 6. UPDATE RLS POLICIES FOR NEW COLUMNS
-- Allow staff to see schedules for their location
DROP POLICY IF EXISTS "Staff can view location schedules" ON public.staff_schedules;
CREATE POLICY "Staff can view location schedules" ON public.staff_schedules
    FOR SELECT USING (
        restaurant_location_id IN (
            SELECT restaurant_location_id FROM public.restaurant_staff WHERE user_id = auth.uid()
        )
    );
