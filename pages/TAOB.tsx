import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { Check, Play, BookOpen, Infinity, MessageCircle, Send, Copy } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const TAOB: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const [copiedBaridi, setCopiedBaridi] = useState(false);
  const [copiedCCP, setCopiedCCP] = useState(false);

  const handleCopy = (text: string, type: 'baridi' | 'ccp') => {
    navigator.clipboard.writeText(text);
    if (type === 'baridi') {
      setCopiedBaridi(true);
      setTimeout(() => setCopiedBaridi(false), 2000);
    } else {
      setCopiedCCP(true);
      setTimeout(() => setCopiedCCP(false), 2000);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Use batch to stagger elements that appear at the same time
      ScrollTrigger.batch('.fade-up', {
        start: 'top 90%',
        onEnter: (batch) => {
          gsap.fromTo(batch, 
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
              stagger: 0.2,
              overwrite: true
            }
          );
        }
      });

      // Subtle parallax for background blobs
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
    <div ref={mainRef} className="min-h-screen selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden bg-[#fdfaf6]">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="parallax-bg absolute top-[10%] left-[5%] w-96 h-96 bg-rose-100/30 rounded-full blur-[120px]"></div>
        <div className="parallax-bg absolute top-[60%] right-[5%] w-[500px] h-[500px] bg-stone-200/40 rounded-full blur-[150px]"></div>
      </div>
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="pt-40 pb-32 px-6 md:px-12 max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16 md:mb-24 fade-up">
            <h1 className="flex flex-col items-center justify-center mb-6 md:mb-8">
              <span className="font-serif text-rose-400 text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide">The Art Of</span>
              <span className="font-signature text-rose-400 text-6xl sm:text-8xl md:text-[10rem] leading-none -mt-4 sm:-mt-8 md:-mt-12">Buttercream</span>
            </h1>
            <div className="flex items-center justify-center gap-2 md:gap-4">
              <div className="h-[1px] w-8 md:w-12 bg-rose-300"></div>
              <p className="text-sm sm:text-lg md:text-xl font-light text-stone-500 tracking-[0.2em] md:tracking-[0.3em] uppercase text-center">
                Formation en ligne
              </p>
              <div className="h-[1px] w-8 md:w-12 bg-rose-300"></div>
            </div>
          </div>

          <div className="space-y-20 md:space-y-32 text-stone-700">
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center space-y-4 fade-up">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-6">
                  <Play size={24} />
                </div>
                <h3 className="font-serif text-xl text-stone-900">Vidéos Détaillées</h3>
                <p className="font-light text-stone-500 text-sm leading-relaxed">Des explications claires et détaillées pour maîtriser chaque geste.</p>
              </div>
              <div className="text-center space-y-4 fade-up">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-6">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-serif text-xl text-stone-900">Guide PDF</h3>
                <p className="font-light text-stone-500 text-sm leading-relaxed">Un support écrit complet que vous pouvez consulter à tout moment.</p>
              </div>
              <div className="text-center space-y-4 fade-up">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-6">
                  <Infinity size={24} />
                </div>
                <h3 className="font-serif text-xl text-stone-900">Accès Illimité</h3>
                <p className="font-light text-stone-500 text-sm leading-relaxed">Profitez de la formation à vie et à votre propre rythme.</p>
              </div>
            </div>

            {/* What you will learn */}
            <section className="max-w-4xl mx-auto">
              <div className="text-center mb-12 fade-up">
                <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">Le Programme</h2>
                <p className="text-stone-500 font-light">Tout ce que vous allez apprendre dans cette formation</p>
              </div>
              
              <div className="bg-white/40 border border-rose-100/50 p-6 sm:p-8 md:p-12 rounded-[2rem] shadow-sm fade-up">
                <ul className="space-y-4 md:space-y-6">
                  {[
                    "La recette exacte de ma crème au beurre",
                    "La méthode complète étape par étape",
                    "Comment éviter les erreurs les plus fréquentes",
                    "Comment rattraper une crème au beurre ratée",
                    "Des solutions aux problèmes courants"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 md:gap-4">
                      <div className="mt-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-rose-500" />
                      </div>
                      <span className="text-base md:text-lg font-light text-stone-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Access */}
            <section className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-stone-900 text-white p-8 md:p-10 rounded-[2rem] flex flex-col items-center text-center fade-up">
                  <Send size={28} className="text-rose-400 mb-4 md:mb-6" />
                  <h3 className="text-xl md:text-2xl font-serif mb-3 md:mb-4">Canal Telegram</h3>
                  <p className="font-light text-stone-400 text-sm md:text-base">Où se trouvera l'intégralité du contenu de la formation.</p>
                </div>
                <div className="bg-rose-50 p-8 md:p-10 rounded-[2rem] flex flex-col items-center text-center border border-rose-100 fade-up">
                  <MessageCircle size={28} className="text-rose-400 mb-4 md:mb-6" />
                  <h3 className="text-xl md:text-2xl font-serif text-stone-900 mb-3 md:mb-4">Groupe de Discussion</h3>
                  <p className="font-light text-stone-600 text-sm md:text-base">Un espace d'échange où je répondrai personnellement à vos questions.</p>
                </div>
              </div>
            </section>

            {/* Payment & Form */}
            <section className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-0">
                
                {/* Payment Info */}
                <div className="lg:col-span-2 bg-stone-900 text-white p-8 sm:p-10 lg:p-12 rounded-[2rem] lg:rounded-r-none relative z-10 shadow-xl fade-up">
                  <h2 className="text-2xl md:text-3xl font-serif mb-8 md:mb-10 text-rose-100">Paiement</h2>
                  
                  <div className="space-y-6 md:space-y-8">
                    <div 
                      className="group cursor-pointer"
                      onClick={() => handleCopy('00799999002594505475', 'baridi')}
                    >
                      <div className="flex items-center gap-3 mb-1 md:mb-2">
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-400">BaridiMob</p>
                        {copiedBaridi ? (
                          <span className="text-green-400 text-[10px] flex items-center gap-1"><Check size={12} /> Copié</span>
                        ) : (
                          <span className="text-stone-500 text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={12} /> Copier</span>
                        )}
                      </div>
                      <p className="text-lg md:text-xl font-mono text-white tracking-wider break-all group-hover:text-rose-200 transition-colors">00799999002594505475</p>
                    </div>
                    
                    <div 
                      className="group cursor-pointer"
                      onClick={() => handleCopy('002594505475', 'ccp')}
                    >
                      <div className="flex items-center gap-3 mb-1 md:mb-2">
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-400">CCP</p>
                        {copiedCCP ? (
                          <span className="text-green-400 text-[10px] flex items-center gap-1"><Check size={12} /> Copié</span>
                        ) : (
                          <span className="text-stone-500 text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={12} /> Copier</span>
                        )}
                      </div>
                      <p className="text-lg md:text-xl font-mono text-white tracking-wider group-hover:text-rose-200 transition-colors">0025945054 <span className="text-stone-400 text-sm group-hover:text-rose-200/70 transition-colors">clé</span> 75</p>
                    </div>
                    
                    <div>
                      <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-400 mb-1 md:mb-2">Nom</p>
                      <p className="text-xl md:text-2xl font-serif text-rose-200">Abid Asmaa</p>
                    </div>
                  </div>

                  <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-stone-800">
                    <p className="text-xs md:text-sm font-light text-stone-400 italic leading-relaxed">
                      Les personnes qui souhaitent payer avec Paypal, je vais mettre un Paypal en place prochainement afin de pouvoir accepter vos paiements.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="lg:col-span-3 bg-white p-8 sm:p-10 lg:p-16 rounded-[2rem] lg:rounded-l-none border border-stone-100 shadow-xl lg:-ml-4 fade-up">
                  <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-2">Rejoindre la formation</h2>
                  <p className="text-sm md:text-base text-stone-500 font-light mb-8 md:mb-10">Remplissez ce formulaire après avoir effectué votre paiement.</p>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Nom complet</label>
                        <input type="text" id="name" className="w-full px-0 py-3 bg-transparent border-b border-stone-200 focus:border-rose-400 outline-none transition-colors font-light" placeholder="Votre nom" required />
                      </div>
                      <div>
                        <label htmlFor="instagram" className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Instagram @</label>
                        <input type="text" id="instagram" className="w-full px-0 py-3 bg-transparent border-b border-stone-200 focus:border-rose-400 outline-none transition-colors font-light" placeholder="@votre_compte" required />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Numéro Telegram</label>
                      <input type="tel" id="phone" className="w-full px-0 py-3 bg-transparent border-b border-stone-200 focus:border-rose-400 outline-none transition-colors font-light" placeholder="Votre numéro" required />
                    </div>
                    
                    <div className="pt-2 md:pt-4">
                      <label htmlFor="proof" className="block text-xs uppercase tracking-widest text-stone-500 mb-3 md:mb-4">Preuve de paiement (photo)</label>
                      <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 md:p-8 text-center hover:border-rose-300 transition-colors cursor-pointer group">
                        <input type="file" id="proof" accept="image/*" className="hidden" required />
                        <label htmlFor="proof" className="cursor-pointer flex flex-col items-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                            <Send size={18} className="md:w-5 md:h-5" />
                          </div>
                          <span className="text-sm md:text-base text-stone-600 font-medium mb-1">Cliquez pour uploader</span>
                          <span className="text-xs md:text-sm text-stone-400 font-light">preuve du virement</span>
                        </label>
                      </div>
                    </div>
                    
                    <button type="submit" className="w-full mt-8 bg-stone-900 text-white py-5 rounded-xl font-medium tracking-[0.2em] uppercase text-sm hover:bg-rose-400 transition-colors">
                      Soumettre l'inscription
                    </button>
                  </form>
                </div>

              </div>
            </section>

          </div>
        </main>
        
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
};
