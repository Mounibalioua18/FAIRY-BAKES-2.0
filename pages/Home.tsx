import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Gallery } from '../components/Gallery';
import { Menu } from '../components/Menu';
import { Process } from '../components/Process';
import { OrderForm } from '../components/OrderForm';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';

gsap.registerPlugin(ScrollTrigger);

export const Home: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sophisticated section entry: Clip-path reveal + y-offset
      const sections = gsap.utils.toArray('section:not(.no-reveal)');
      sections.forEach((section: any) => {
        gsap.fromTo(section, 
          { 
            opacity: 0, 
            y: 100,
            clipPath: 'inset(10% 0% 10% 0%)'
          },
          { 
            opacity: 1, 
            y: 0, 
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.8, 
            ease: 'expo.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // Subtle parallax for any background blobs
      gsap.to('.parallax-bg', {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="parallax-bg absolute top-[10%] left-[5%] w-96 h-96 bg-rose-100/30 rounded-full blur-[120px]"></div>
        <div className="parallax-bg absolute top-[60%] right-[5%] w-[500px] h-[500px] bg-stone-200/40 rounded-full blur-[150px]"></div>
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Gallery />
          <Menu />
          <Process />
          <OrderForm />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
};
