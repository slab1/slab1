import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;
    
    const initializeAuth = async () => {
      try {
        if (!initialized) {
          console.log('AuthSession: Getting initial session...');
          // Get initial session
          const { data: { session: initialSession }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error getting session:", error);
          }
          
          if (mounted) {
            console.log('Initial session data:', !!initialSession);
            setSession(initialSession);
            setInitialized(true);
            setLoading(false);
          }
        }

        // Set up auth state listener - always do this if not already done
        if (!authSubscription) {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
              console.log('Auth state change:', event, !!currentSession);
              if (mounted) {
                setSession(currentSession);
                setLoading(false);
              }
            }
          );
          authSubscription = subscription;
        }
      } catch (error) {
        console.error("Error during initial auth check:", error);
        if (mounted) {
          setSession(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        console.log('AuthSession: Unsubscribing listener');
        authSubscription.unsubscribe();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove initialized from dependencies to prevent re-running and unsubscribing

  return { session, setSession, loading, initialized };
};
