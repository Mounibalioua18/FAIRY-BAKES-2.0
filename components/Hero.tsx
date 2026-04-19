
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { PortfolioItem } from '../hooks/usePortfolio';

interface HeroProps {
  mainImage: PortfolioItem;
}

export const Hero: React.FC<HeroProps> = ({ mainImage }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    
    // Initial entrance
    tl.fromTo(titleRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5 }
    )
    .fromTo('.hero-fade-in',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2 },
      "-=1"
    )
    .fromTo(imageContainerRef.current,
      { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.1 },
      { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 2 },
      "-=1.5"
    );

    // Continuous subtle parallax for the image
    gsap.to(imageRef.current, {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: imageContainerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }, []);

  return (
    <section className="no-reveal pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        {/* Text content - Appears first for mobile */}
        <div ref={contentRef} className="lg:col-span-5 z-10">
          <span className="hero-fade-in inline-block text-rose-400 uppercase tracking-[0.3em] text-xs font-semibold mb-4">
            Gâteaux Artisanaux d'Alger
          </span>
          <h1 ref={titleRef} className="text-5xl md:text-7xl lg:text-8xl font-serif leading-tight text-stone-900 mb-6">
            L'Art Gourmand <br />
            <span className="italic font-normal text-stone-600">pour vos</span> <br />
            Moments Uniques
          </h1>
          <p className="hero-fade-in text-stone-500 text-lg md:text-xl max-w-md leading-relaxed mb-10 font-light">
            Nous transformons la farine et le sucre en chefs-d'œuvre floraux et féeriques. Chaque gâteau est une histoire unique racontée à travers des strates de gourmandise. Vous souhaitez maîtriser notre art ? Découvrez notre formation exclusive <strong className="font-medium text-stone-800">TAOB</strong>.
          </p>
          <div className="hero-fade-in flex flex-col sm:flex-row gap-4 mb-10 lg:mb-0">
            <a href="/#order" className="bg-rose-100 text-rose-800 px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-widest hover:bg-rose-200 transition-all text-center shadow-sm">
              Réserver Votre Date
            </a>
            <Link to="/taob" className="border border-stone-200 text-stone-600 px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-widest hover:bg-stone-50 transition-all text-center">
              Rejoindre TAOB
            </Link>
          </div>
        </div>

        {/* Image content - Appears under text on mobile, on right on desktop */}
        <div ref={imageContainerRef} className="lg:col-span-7 relative h-[450px] md:h-[650px] lg:h-[750px] rounded-[2.5rem] overflow-hidden shadow-2xl">
          <img 
            ref={imageRef}
            src={mainImage.image_url} 
            alt={mainImage.title} 
            className="w-full h-[115%] absolute -top-[7.5%] object-cover"
            key={mainImage.image_url /* Force re-render of image if it changes fast enough */}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-10 text-white">
            <p className="hero-fade-in text-xs uppercase tracking-[0.2em] font-medium opacity-80">{mainImage.description || 'À la Une'}</p>
            <h3 className="hero-fade-in text-3xl font-serif">{mainImage.title || 'Midnight Navy Ruffle'}</h3>
          </div>
        </div>
      </div>
    </section>
  );
};
