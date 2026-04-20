-- Add audit triggers for loyalty-related tables
-- This ensures that changes made by system admins or owners are tracked

-- First, ensure loyalty_programs and loyalty_rewards are audited
DO $$ 
DECLARE 
    t TEXT;
    tables_to_audit TEXT[] := ARRAY['loyalty_programs', 'loyalty_rewards'];
BEGIN
    FOREACH t IN ARRAY tables_to_audit LOOP
        -- Add Audit Trigger
        EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger_%I ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER audit_trigger_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.process_audit_log()', t, t);
    END LOOP;
END $$;
