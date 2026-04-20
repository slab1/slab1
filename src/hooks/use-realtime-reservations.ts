
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/api/types';

interface RealtimeReservationsHook {
  reservations: Reservation[];
  isConnected: boolean;
  subscribe: (locationId?: string) => void;
  unsubscribe: () => void;
}

export function useRealtimeReservations(): RealtimeReservationsHook {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  const subscribe = useCallback((locationId?: string) => {
    if (channel) {
      supabase.removeChannel(channel);
    }

    const newChannel = supabase
      .channel('reservations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: locationId ? `restaurant_location_id=eq.${locationId}` : undefined,
        },
        (payload) => {
          console.log('Reservation update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setReservations(prev => [...prev, payload.new as Reservation]);
              break;
            case 'UPDATE':
              setReservations(prev => 
                prev.map(res => res.id === payload.new.id ? payload.new as Reservation : res)
              );
              break;
            case 'DELETE':
              setReservations(prev => 
                prev.filter(res => res.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(newChannel);
  }, [channel]);

  const unsubscribe = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
      setIsConnected(false);
    }
  }, [channel]);

  useEffect(() => {
    return () => unsubscribe();
  }, [unsubscribe]);

  return {
    reservations,
    isConnected,
    subscribe,
    unsubscribe,
  };
}
