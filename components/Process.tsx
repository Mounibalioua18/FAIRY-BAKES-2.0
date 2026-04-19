
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Calendar, Heart, Palette } from 'lucide-react';
import { PortfolioItem } from '../hooks/usePortfolio';

const STEPS = [
  {
    icon: Calendar,
    title: 'Sélection Mensuelle',
    description: 'Les commandes ouvrent vers la fin de chaque mois pour le mois suivant. Les places sont limitées pour garantir une précision artistique optimale.'
  },
  {
    icon: Palette,
    title: 'Consultation Personnalisée',
    description: 'Nous discutons de votre vision, de vos palettes de couleurs et de vos préférences florales pour créer une pièce maîtresse véritablement unique.'
  },
  {
    icon: Heart,
    title: 'Confectionné avec Amour',
    description: 'Des ingrédients de première qualité préparés frais. Notre crème au beurre signature est légère, soyeuse et équilibrée.'
  }
];

interface ProcessProps {
  processImages: PortfolioItem[];
}

export const Process: React.FC<ProcessProps> = ({ processImages }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%',
      }
    });

    tl.fromTo('.process-step',
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.5, ease: 'expo.out', stagger: 0.3 }
    )
    .fromTo('.process-image',
      { scale: 0.8, opacity: 0, rotate: -5 },
      { scale: 1, opacity: 1, rotate: 0, duration: 2, ease: 'power4.out' },
      "-=1.5"
    );
  }, []);

  return (
    <section id="process" className="py-24 bg-stone-50 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto" ref={containerRef}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-rose-400 uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">La Méthode Fairy</span>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-12">Notre Processus de Création</h2>
            <div className="space-y-12">
              {STEPS.map((step, index) => (
                <div key={index} className="process-step flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
                    <step.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-stone-800 mb-2">{step.title}</h3>
                    <p className="text-stone-500 leading-relaxed font-light">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img 
                src={processImages[0]?.image_url || ""} 
                className="process-image rounded-2xl shadow-2xl mt-12 w-full aspect-[3/4] object-cover"
                alt={processImages[0]?.title || "Artisan cake preparation"}
              />
              <img 
                src={processImages[1]?.image_url || ""} 
                className="process-image rounded-2xl shadow-2xl w-full aspect-[3/4] object-cover"
                alt={processImages[1]?.title || "Detailed cake decoration"}
              />
            </div>
            {/* Soft decorative glow background */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-200/20 rounded-full blur-[100px]"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
