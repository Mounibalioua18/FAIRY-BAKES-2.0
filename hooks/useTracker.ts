import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const VISITOR_KEY = 'fairy_bakes_visitor_id';

export function useTracker() {
  useEffect(() => {
    // 1. Get or create a PERMANENT unique visitor ID for this browser
    let visitorId = localStorage.getItem(VISITOR_KEY);

    // If no visitor ID exists, create one forever
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, visitorId);
    }

    const ping = async () => {
      try {
        // We use a simple insert with ON CONFLICT DO UPDATE style upsert
        const { error } = await supabase
          .from('site_stats')
          .upsert(
            { 
              session_id: visitorId, // This is now a permanent visitor ID
              last_ping: new Date().toISOString()
            },
            { onConflict: 'session_id' }
          );
        
        if (error) {
          console.error('[Tracker] Heartbeat failed:', error.message);
        }
      } catch (err) {
        // Silently fail
      }
    };

    let interval: ReturnType<typeof setInterval>;

    // Wait 12 seconds before counting as a real visit (filters out ghost tabs/fast bounces)
    const initialDelay = setTimeout(() => {
      ping();
      // Heartbeat every 30 seconds after the initial delay
      interval = setInterval(ping, 30000);
    }, 12000);

    return () => {
      clearTimeout(initialDelay);
      if (interval) clearInterval(interval);
    };
  }, []);
}
