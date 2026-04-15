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
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};
