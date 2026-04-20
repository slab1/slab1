
-- Migration to add missing menu-related tables and fix is_owner function
-- Date: 2026-02-03

-- 1. FIX is_owner FUNCTIONS
-- Update is_owner to include restaurant_owner role and match existing roles table
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('superadmin', 'system_admin', 'restaurant_owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add is_owner_user as the new standard
CREATE OR REPLACE FUNCTION public.is_owner_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_owner();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alias is_admin and is_admin_user to is_owner for backward compatibility but mark as deprecated in logic
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_owner();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_owner();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CREATE MISSING TABLES

-- Create menu_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create menu_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    preparation_time INTEGER, -- in minutes
    dietary_tags TEXT[],
    allergens TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ingredients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    reorder_threshold NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create menu_item_ingredients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.menu_item_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    quantity_required NUMERIC(10,2) NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE RLS AND ADD POLICIES

-- Enable RLS
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_ingredients ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR menu_categories
DROP POLICY IF EXISTS "Anyone can view active menu categories" ON public.menu_categories;
CREATE POLICY "Anyone can view active menu categories" ON public.menu_categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Owners can manage menu categories" ON public.menu_categories;
CREATE POLICY "Owners can manage menu categories" ON public.menu_categories
    FOR ALL USING (
        public.is_owner() AND 
        restaurant_id IN (
            SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
        )
    );

-- POLICIES FOR menu_items
DROP POLICY IF EXISTS "Anyone can view available menu items" ON public.menu_items;
CREATE POLICY "Anyone can view available menu items" ON public.menu_items
    FOR SELECT USING (is_available = true);

DROP POLICY IF EXISTS "Owners can manage menu items" ON public.menu_items;
CREATE POLICY "Owners can manage menu items" ON public.menu_items
    FOR ALL USING (
        public.is_owner() AND 
        restaurant_id IN (
            SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
        )
    );

-- POLICIES FOR ingredients
DROP POLICY IF EXISTS "Owners can manage ingredients" ON public.ingredients;
CREATE POLICY "Owners can manage ingredients" ON public.ingredients
    FOR ALL USING (
        public.is_owner() AND 
        restaurant_id IN (
            SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
        )
    );

-- POLICIES FOR menu_item_ingredients
DROP POLICY IF EXISTS "Owners can manage menu item ingredients" ON public.menu_item_ingredients;
CREATE POLICY "Owners can manage menu item ingredients" ON public.menu_item_ingredients
    FOR ALL USING (
        public.is_owner() AND 
        menu_item_id IN (
            SELECT id FROM public.menu_items WHERE restaurant_id IN (
                SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid()
                UNION
                SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
            )
        )
    );

-- 4. ADD TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_menu_categories_updated_at ON public.menu_categories;
CREATE TRIGGER trg_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER trg_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_ingredients_updated_at ON public.ingredients;
CREATE TRIGGER trg_ingredients_updated_at BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_menu_item_ingredients_updated_at ON public.menu_item_ingredients;
CREATE TRIGGER trg_menu_item_ingredients_updated_at BEFORE UPDATE ON public.menu_item_ingredients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. CREATE MISSING LOYALTY TABLES

-- Create loyalty_rewards table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create loyalty_redemptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.loyalty_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES public.loyalty_rewards(id) ON DELETE CASCADE,
    points_used INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ENABLE RLS AND ADD POLICIES FOR LOYALTY TABLES

-- Enable RLS
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR loyalty_rewards
DROP POLICY IF EXISTS "Anyone can view active loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Anyone can view active loyalty rewards" ON public.loyalty_rewards
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Admins can manage loyalty rewards" ON public.loyalty_rewards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('superadmin', 'system_admin')
        )
    );

-- POLICIES FOR loyalty_redemptions
DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.loyalty_redemptions;
CREATE POLICY "Users can view their own redemptions" ON public.loyalty_redemptions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own redemptions" ON public.loyalty_redemptions;
CREATE POLICY "Users can insert their own redemptions" ON public.loyalty_redemptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- POLICIES FOR loyalty_programs
DROP POLICY IF EXISTS "Anyone can view active loyalty programs" ON public.loyalty_programs;
CREATE POLICY "Anyone can view active loyalty programs" ON public.loyalty_programs
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Owners can manage loyalty programs" ON public.loyalty_programs;
CREATE POLICY "Owners can manage loyalty programs" ON public.loyalty_programs
    FOR ALL USING (
        public.is_owner() AND 
        restaurant_id IN (
            SELECT restaurant_id FROM public.restaurant_staff WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
        )
    );

-- 7. ADD TRIGGERS FOR LOYALTY UPDATED_AT
DROP TRIGGER IF EXISTS trg_loyalty_rewards_updated_at ON public.loyalty_rewards;
CREATE TRIGGER trg_loyalty_rewards_updated_at BEFORE UPDATE ON public.loyalty_rewards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. ADD INDEXES FOR LOYALTY
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_user_id ON public.loyalty_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_reward_id ON public.loyalty_redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_is_active ON public.loyalty_rewards(is_active);

-- 9. ADD lifetime_points TO loyalty_points
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'loyalty_points' 
        AND column_name = 'lifetime_points'
    ) THEN
        ALTER TABLE public.loyalty_points ADD COLUMN lifetime_points INTEGER DEFAULT 0;
        -- Initialize lifetime_points with current points for existing users
        UPDATE public.loyalty_points SET lifetime_points = points WHERE lifetime_points = 0;
    END IF;
END $$;

-- 10. CREATE ATOMIC REDEEM FUNCTION
CREATE OR REPLACE FUNCTION public.redeem_loyalty_reward(
    p_user_id UUID,
    p_reward_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_points_required INTEGER;
    v_current_points INTEGER;
    v_reward_name TEXT;
    v_new_points INTEGER;
BEGIN
    -- Get reward details
    SELECT points_required, name INTO v_points_required, v_reward_name
    FROM public.loyalty_rewards
    WHERE id = p_reward_id AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Reward not found or inactive');
    END IF;

    -- Get user points
    SELECT points INTO v_current_points
    FROM public.loyalty_points
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'User loyalty account not found');
    END IF;

    -- Check points
    IF v_current_points < v_points_required THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient points');
    END IF;

    -- 1. Deduct points
    UPDATE public.loyalty_points
    SET points = points - v_points_required,
        updated_at = now()
    WHERE user_id = p_user_id
    RETURNING points INTO v_new_points;

    -- 2. Record redemption
    INSERT INTO public.loyalty_redemptions (user_id, reward_id, points_used)
    VALUES (p_user_id, p_reward_id, v_points_required);

    -- 3. Log transaction
    INSERT INTO public.loyalty_points_transactions (user_id, points, description, transaction_type)
    VALUES (p_user_id, -v_points_required, 'Redeemed reward: ' || v_reward_name, 'debit');

    RETURN jsonb_build_object(
        'success', true, 
        'new_points_balance', v_new_points,
        'message', 'Reward redeemed successfully'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
