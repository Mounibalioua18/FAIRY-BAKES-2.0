
import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Logic: Appear after scrolling roughly 80% of the first viewport (past the main hero content)
      const threshold = window.innerHeight * 0.7;
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    // Initial check in case they refresh while scrolled down
    toggleVisibility();
    
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-[60] lg:hidden p-4 rounded-full bg-rose-400 text-white shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-24 opacity-0 scale-50 pointer-events-none'
      } active:scale-90 hover:bg-rose-500`}
      aria-label="Scroll to top"
    >
      <ChevronUp size={24} strokeWidth={2.5} />
      {/* Subtle pulse animation to draw attention on mobile */}
      <div className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-20 pointer-events-none"></div>
    </button>
  );
};
