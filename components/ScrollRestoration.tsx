import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollRestoration = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small timeout to ensure the new page has rendered before scrolling
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Force scroll reset immediately and also just after render to override any lingering UI flashes
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), 50);
    }
  }, [pathname, hash]);

  return null;
};
