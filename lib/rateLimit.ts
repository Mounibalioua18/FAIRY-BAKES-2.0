export const SUBMISSIONS_KEY = 'fairy_bakes_submissions';
const MAX_SUBMISSIONS = 3;
const COOLDOWN_MS = 60 * 1000; // 1 minute
const RESET_MS = 2 * 60 * 60 * 1000; // 2 hours

export function checkRateLimit(): { allowed: boolean; errorMessage?: string } {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    let submissions: number[] = raw ? JSON.parse(raw) : [];
    
    if (!Array.isArray(submissions)) {
      submissions = [];
    }
    
    // Filter out submissions older than the reset time
    submissions = submissions.filter(time => now - time < RESET_MS);
    
    if (submissions.length >= MAX_SUBMISSIONS) {
      const oldest = Math.min(...submissions);
      const msUntilReset = RESET_MS - (now - oldest);
      const hours = Math.floor(msUntilReset / (60 * 60 * 1000));
      const mins = Math.ceil((msUntilReset % (60 * 60 * 1000)) / 60000);
      
      let timeString = '';
      if (hours > 0) {
        timeString += `${hours} heure${hours > 1 ? 's' : ''} `;
      }
      if (mins > 0) {
        timeString += `${mins} minute${mins > 1 ? 's' : ''}`;
      }
      
      return { 
        allowed: false, 
        errorMessage: `Vous avez envoyé beaucoup de demandes, veuillez patienter un moment avant de réessayer.` 
      };
    }
    
    if (submissions.length > 0) {
      const lastSub = Math.max(...submissions);
      if (now - lastSub < COOLDOWN_MS) {
        const msUntilCooldown = COOLDOWN_MS - (now - lastSub);
        const secs = Math.ceil(msUntilCooldown / 1000);
        return { 
          allowed: false, 
          errorMessage: `Veuillez patienter un instant avant d'envoyer une autre demande.` 
        };
      }
    }
    
    return { allowed: true };
  } catch (err) {
    console.error('Rate limit check error:', err);
    // Allow by default if things fail
    return { allowed: true };
  }
}

export function recordSubmission() {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    let submissions: number[] = raw ? JSON.parse(raw) : [];
    
    if (!Array.isArray(submissions)) {
      submissions = [];
    }
    
    // Filter out old ones before pushing new
    submissions = submissions.filter(time => now - time < RESET_MS);
    submissions.push(now);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch (err) {
    console.error('Rate limit record error:', err);
  }
}
