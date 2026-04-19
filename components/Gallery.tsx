
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { PortfolioItem } from '../hooks/usePortfolio';

interface GalleryProps {
  galleryImages: PortfolioItem[];
}

export const Gallery: React.FC<GalleryProps> = ({ galleryImages }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = gsap.utils.toArray('.gallery-item');
    gsap.fromTo(items, 
      { opacity: 0, y: 100, scale: 0.95 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 1.8,
        ease: 'expo.out',
        stagger: 0.25,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      }
    );
  }, []);

  return (
    <section id="gallery" className="py-24 bg-white px-6 md:px-12">
      <div className="max-w-7xl mx-auto" ref={containerRef}>
        <div className="text-center mb-16">
          <span className="font-signature text-3xl text-rose-300 block mb-2">sélection</span>
          <h2 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6">Le Jardin des Fairies</h2>
          <div className="h-px w-24 bg-stone-200 mx-auto"></div>
          <p className="mt-8 text-stone-500 max-w-xl mx-auto font-light leading-relaxed text-lg">
            Chaque création est sur mesure, confectionnée à la main avec une attention particulière aux textures délicates et aux palettes de couleurs de saison.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {galleryImages.map((cake) => (
            <div key={cake.id} className="gallery-item group cursor-pointer overflow-hidden rounded-3xl relative shadow-sm hover:shadow-2xl transition-shadow duration-700">
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src={cake.image_url} 
                  alt={cake.title}
                  className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/60 transition-all duration-700 flex flex-col items-center justify-end p-10">
                <div className="text-center opacity-0 group-hover:opacity-100 transform translate-y-10 group-hover:translate-y-0 transition-all duration-700 text-white">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold mb-3 block text-rose-200">{cake.description}</span>
                  <h3 className="text-2xl md:text-3xl font-serif mb-4">{cake.title}</h3>
                  <div className="h-px w-10 bg-white/30 mx-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
