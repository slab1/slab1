
-- Create shift_types table
CREATE TABLE public.shift_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    color TEXT DEFAULT 'bg-blue-500',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create staff_schedules table
CREATE TABLE public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.restaurant_staff(id) ON DELETE CASCADE,
    shift_type_id UUID REFERENCES public.shift_types(id) ON DELETE SET NULL,
    work_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can manage their own shift types" ON public.shift_types
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM public.restaurants WHERE user_id = auth.uid()
            OR id IN (SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid() AND role = 'manager')
        )
    );

CREATE POLICY "Partners can manage their own staff schedules" ON public.staff_schedules
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM public.restaurants WHERE user_id = auth.uid()
            OR id IN (SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid() AND role = 'manager')
        )
    );

CREATE POLICY "Staff can view their own schedules" ON public.staff_schedules
    FOR SELECT USING (
        staff_id IN (
            SELECT id FROM public.restaurant_staff WHERE user_id = auth.uid()
        )
    );

-- Insert default shift types for all existing restaurants
INSERT INTO public.shift_types (restaurant_id, name, start_time, end_time, color)
SELECT id, 'Morning', '06:00'::time, '14:00'::time, 'bg-blue-500' FROM public.restaurants
UNION ALL
SELECT id, 'Afternoon', '14:00'::time, '22:00'::time, 'bg-green-500' FROM public.restaurants
UNION ALL
SELECT id, 'Night', '22:00'::time, '06:00'::time, 'bg-purple-500' FROM public.restaurants
UNION ALL
SELECT id, 'Split', '11:00'::time, '15:00'::time, 'bg-orange-500' FROM public.restaurants;