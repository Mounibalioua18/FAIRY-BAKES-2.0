import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_KEY = 'fairy_bakes_session_id';
const LAST_ACTIVE_KEY = 'fairy_bakes_last_active';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export function useTracker() {
  useEffect(() => {
    const now = Date.now();
    // 1. Get or create a unique session ID for this browser
    let sessionId = localStorage.getItem(SESSION_KEY);
    const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);

    // If no session, or if inactive for more than 30 minutes, create a new session
    if (!sessionId || !lastActive || (now - parseInt(lastActive, 10) > SESSION_TIMEOUT)) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    
    // Update local activity timestamp
    localStorage.setItem(LAST_ACTIVE_KEY, now.toString());

    const ping = async () => {
      // Keep local activity alive for across-tab shared logic
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());

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
