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
        await supabase
          .from('site_stats')
          .upsert({ 
            session_id: sessionId, 
            last_ping: new Date().toISOString()
          }, { 
            onConflict: 'session_id' 
          });
      } catch (err) {
        // Silently fail to not disturb user experience
        console.debug('Tracking ping failed');
      }
    };

    // Initial ping on arrival
    ping();

    // Heartbeat every 60 seconds
    const interval = setInterval(ping, 60000);

    return () => clearInterval(interval);
  }, []);
}
