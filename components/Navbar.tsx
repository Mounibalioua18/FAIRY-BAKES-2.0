
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isTAOB = location.pathname === '/taob';

  return (
    <nav className="fixed top-0 left-0 w-full z-50 custom-glass border-b border-rose-100/30 h-24 flex items-center justify-center md:justify-between px-6 md:px-12 transition-all duration-500">
      <a 
        href="/" 
        className="flex flex-col items-center md:items-start group cursor-pointer hover:opacity-80 transition-all duration-300 active:scale-95"
        aria-label="Fairy Bakes Home"
      >
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl md:text-3xl font-serif tracking-[0.15em] uppercase text-stone-800 font-bold">
            Fairy
          </span>
          <span className="text-3xl md:text-4xl font-signature text-rose-400 -ml-2 -rotate-6 transform translate-y-1">
            bakes
          </span>
        </div>
      </a>
      
      <div className="hidden md:flex space-x-6 md:space-x-12 text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-semibold text-stone-500">
        <Link 
          to="/taob" 
          onClick={(e) => {
            // Force reset when changing context completely to avoid route-hash conflicts
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          className={`transition-all hover:tracking-[0.4em] ${isTAOB ? 'text-rose-400' : 'hover:text-rose-400'}`}
        >
          TAOB
        </Link>
        <Link 
          to="/#order" 
          onClick={() => {
            if (location.pathname === '/') {
              // If already on the home page, scrolling shouldn't be hijacked by route change
              const el = document.getElementById('order');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="hover:text-rose-400 transition-all hover:tracking-[0.4em]"
        >
          Réserver votre date
        </Link>
      </div>
    </nav>
  );
};