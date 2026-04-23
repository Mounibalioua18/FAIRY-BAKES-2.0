import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_KEY = 'fairy_bakes_session_id';

export function useTracker() {
  useEffect(() => {
    // 1. Get or create a unique session ID for this browser tab
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    const ping = async () => {
      try {
        // We use a simple insert with ON CONFLICT DO UPDATE style upsert
        // In the JS client, upsert() does exactly this.
        const { error } = await supabase
          .from('site_stats')
          .upsert(
            { 
              session_id: sessionId, 
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

    // Initial ping on arrival
    ping();

    // Heartbeat every 30 seconds
    const interval = setInterval(ping, 30000);

    return () => clearInterval(interval);
  }, []);
}
