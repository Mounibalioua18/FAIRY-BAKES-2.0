import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { Check, Play, BookOpen, Infinity, MessageCircle, Send, Copy, AlertCircle, CheckCircle2, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FormStatus } from '../types';
import { usePortfolio } from '../hooks/usePortfolio';

gsap.registerPlugin(ScrollTrigger);

export const TAOB: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const { taobImages, taobPdfImages } = usePortfolio();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedBaridi, setCopiedBaridi] = useState(false);
  const [copiedCCP, setCopiedCCP] = useState(false);
  
  const [status, setStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{name?: boolean, instagram?: boolean, phone?: boolean, proofFile?: boolean}>({});
  const [formData, setFormData] = useState({ name: '', instagram: '', phone: '0' });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // PDF Paper Swipe State
  const [pdfFlipped, setPdfFlipped] = useState(false);
  const [pdfTouchStartX, setPdfTouchStartX] = useState(0);

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollPos = carouselRef.current.scrollLeft;
      const itemWidth = carouselRef.current.clientWidth * 0.8; // 80vw width
      const gap = 24; // 1.5rem (gap-6)
      const newIndex = Math.round(scrollPos / (itemWidth + gap));
      setActiveSlide(Math.min(newIndex, taobImages.length - 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.clientWidth * 0.8;
      const gap = 24;
      carouselRef.current.scrollTo({
        left: index * (itemWidth + gap),
        behavior: 'smooth'
      });
      setActiveSlide(index);
    }
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error for this field
    setFormErrors(prev => ({ ...prev, [e.target.id]: false }));

    if (e.target.id === 'phone') {
      // Allow only numbers and force to start with '0'
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 0 && val[0] !== '0') {
        val = '0' + val;
      }
      if (val.length <= 10) {
        setFormData(prev => ({ ...prev, [e.target.id]: val }));
      }
    } else {
      setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error for image
    setFormErrors(prev => ({ ...prev, proofFile: false }));
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("File is too large. Max 50MB.");
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setProofFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Check all fields at once to show all errors
    const errors: any = {};
    if (!formData.name.trim()) errors.name = true;
    if (!formData.instagram.trim()) errors.instagram = true;
    if (!/^0[0-9]{9}$/.test(formData.phone)) errors.phone = true;
    if (!proofFile) errors.proofFile = true;

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setStatus(FormStatus.SUBMITTING);
    setErrorMessage(null);

    try {
      // 1. Upload proof to Supabase Storage 'proofs' bucket
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, proofFile);
        
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(filePath);

      // 2. Insert record into taob_signups
      const { error: insertError } = await supabase
        .from('taob_signups')
        .insert([
          {
            name: formData.name,
            instagram: formData.instagram,
            phone: formData.phone,
            proof_image_url: publicUrl
          }
        ]);

      if (insertError) throw insertError;

      setStatus(FormStatus.SUCCESS);
      setFormData({ name: '', instagram: '', phone: '0' });
      setProofFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('Supabase error:', error);
      setStatus(FormStatus.ERROR);
      setErrorMessage(error.message || 'Une erreur est survenue. Veuillez réessayer.');
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

      // Gallery entrance exactly like the first page but far more dramatic (to be more noticeable!)
      if (carouselRef.current) {
        const taobGalleryItems = gsap.utils.toArray('.taob-gallery-item');
        gsap.fromTo(taobGalleryItems, 
          { opacity: 0, y: 150, scale: 0.85, rotation: 3 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            rotation: 0,
            duration: 1.6,
            ease: 'back.out(1.2)',
            stagger: 0.15,
            scrollTrigger: {
              trigger: carouselRef.current,
              start: 'top 75%',
            }
          }
        );

        // Mobile Controls Animation tied to scroll
        gsap.fromTo('.taob-nav-left',
          { x: -50, opacity: 0 },
          { 
            x: 0, 
            opacity: 1, 
            duration: 1, 
            ease: 'back.out(1.5)', 
            scrollTrigger: {
              trigger: carouselRef.current,
              start: 'top 70%',
              end: 'center center',
              scrub: 1
            }
          }
        );

        gsap.fromTo('.taob-nav-right',
          { x: 50, opacity: 0 },
          { 
            x: 0, 
            opacity: 1, 
            duration: 1, 
            ease: 'back.out(1.5)', 
            scrollTrigger: {
              trigger: carouselRef.current,
              start: 'top 70%',
              end: 'center center',
              scrub: 1
            }
          }
        );

        gsap.fromTo('.taob-nav-dots',
          { y: 30, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 1, 
            ease: 'back.out(1.5)', 
            scrollTrigger: {
              trigger: carouselRef.current,
              start: 'top 70%',
              end: 'center center',
              scrub: 1
            }
          }
        );
      }
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
        
        <main className="pt-28 md:pt-48 pb-32 px-6 md:px-12 max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-24 fade-up">
            <h1 className="flex flex-col items-center justify-center mb-4 md:mb-8">
              <span className="font-serif text-rose-400 text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide relative z-10">The Art Of</span>
              <span className="font-signature text-rose-400 text-6xl sm:text-8xl md:text-[10rem] leading-none -mt-4 sm:-mt-6 md:-mt-8 relative z-0">Buttercream</span>
            </h1>
            <div className="flex items-center justify-center gap-2 md:gap-4 mt-2">
              <div className="h-[1px] w-8 md:w-12 bg-rose-300"></div>
              <p className="text-xs sm:text-lg md:text-xl font-light text-stone-500 tracking-[0.2em] md:tracking-[0.3em] uppercase text-center">
                Formation en ligne
              </p>
              <div className="h-[1px] w-8 md:w-12 bg-rose-300"></div>
            </div>
          </div>

          <div className="space-y-16 md:space-y-32 text-stone-700">
            
            {/* Gallery moved right below header */}
            <section className="max-w-5xl mx-auto pt-0 md:pt-8 mt-2 md:mt-16">
              <div className="relative max-w-5xl mx-auto md:pb-28">
                {/* 
                  Mobile: Flex container with horizontal scroll and snapping 
                  Desktop: Strict 3-column grid
                */}
                <div 
                  ref={carouselRef}
                  onScroll={handleScroll}
                  className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory px-6 md:px-4 pb-4 pt-4 md:pt-0 md:pb-0 md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {taobImages.map((image, index) => {
                    let placementClasses = 'w-[80vw] sm:w-[60vw] md:w-auto shrink-0 snap-center snap-always aspect-[4/5] md:aspect-[3/4]';
                    if (index === 0) {
                      placementClasses += ' md:translate-y-0';
                    } else if (index === 1) {
                      placementClasses += ' md:translate-y-16';
                    } else if (index === 2) {
                      placementClasses += ' md:translate-y-0';
                    }

                    return (
                      <div 
                        key={image.id || index} 
                        className={`taob-gallery-item rounded-[2rem] shadow-sm overflow-hidden ${placementClasses}`}
                      >
                        {image?.image_url?.match(/\.(mp4|webm)$/i) ? (
                          <video src={image.image_url} autoPlay loop muted playsInline className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out" />
                        ) : (
                          <img src={image?.image_url} alt={`Aperçu ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Mobile indicators & arrows */}
                {taobImages.length > 1 && (
                  <div className="md:hidden flex items-center justify-center gap-4 mb-4 mt-2 px-6">
                    <button 
                      onClick={() => scrollToIndex(Math.max(0, activeSlide - 1))}
                      disabled={activeSlide === 0}
                      className="taob-nav-left w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-stone-800 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="taob-nav-dots flex gap-2">
                      {taobImages.map((_, idx) => (
                        <button 
                          key={idx}
                          onClick={() => scrollToIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${activeSlide === idx ? 'w-6 bg-stone-800' : 'w-2 bg-stone-300'}`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button 
                      onClick={() => scrollToIndex(Math.min(taobImages.length - 1, activeSlide + 1))}
                      disabled={activeSlide === taobImages.length - 1}
                      className="taob-nav-right w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-stone-800 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
                
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-2xl bg-rose-200/20 rounded-full blur-[100px] pointer-events-none"></div>
              </div>
            </section>

            {/* Clickable Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pt-8">
              <button 
                onClick={(e) => { e.preventDefault(); document.getElementById('chapitres-video')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="group text-center space-y-4 fade-up cursor-pointer hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-6 group-hover:bg-rose-100 group-hover:text-rose-500 transition-colors shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-rose-100/50">
                  <Play size={24} className="ml-1" />
                </div>
                <h3 className="font-serif text-xl text-stone-900 group-hover:text-rose-500 transition-colors">Vidéos Détaillées</h3>
                <p className="font-light text-stone-500 text-sm leading-relaxed">Des explications claires et détaillées pour maîtriser chaque geste.</p>
              </button>
              
              <button 
                onClick={(e) => { e.preventDefault(); document.getElementById('apercu-formation')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="group text-center space-y-4 fade-up cursor-pointer hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-6 group-hover:bg-rose-100 group-hover:text-rose-500 transition-colors shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-rose-100/50">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-serif text-xl text-stone-900 group-hover:text-rose-500 transition-colors">Guide PDF</h3>
                <p className="font-light text-stone-500 text-sm leading-relaxed">Un support écrit complet que vous pouvez consulter à tout moment.</p>
              </button>
              
              <div className="text-center space-y-4 fade-up">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-6">
                  <Infinity size={24} />
                </div>
                <h3 className="font-serif text-xl text-stone-900">Accès Illimité</h3>
                <p className="font-light text-stone-500 text-sm leading-relaxed">Profitez de la formation à vie et à votre propre rythme.</p>
              </div>
            </div>

            {/* Aperçu de la formation (PDF Preview) */}
            <section id="apercu-formation" className="max-w-3xl mx-auto scroll-mt-32">
              <div className="text-center mb-8 md:mb-12 fade-up px-4">
                <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">Aperçu de la formation</h2>
                <p className="text-stone-500 font-light">Découvrez le contenu du livret PDF exclusif</p>
              </div>
              
              {taobPdfImages && taobPdfImages.length > 0 ? (
                <>
                  {/* Desktop / Tablet View */}
                  <div className="hidden sm:grid sm:grid-cols-2 gap-6 md:gap-8 px-6 md:px-0 fade-up items-start">
                    {taobPdfImages.map((image, index) => (
                      <div 
                        key={image.id || index}
                        className="relative rounded-r-[1.5rem] md:rounded-r-[2rem] rounded-l-sm overflow-hidden shadow-md hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-500 bg-[#fefcfb] border border-stone-200/60 group"
                      >
                        {/* Book Binding/Spine shadow */}
                        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-stone-300/40 to-transparent z-10 pointer-events-none mix-blend-multiply"></div>
                        <div className="absolute inset-y-0 left-0 w-px bg-stone-400/20 z-10"></div>
                        
                        {image.image_url ? (
                          <img 
                            src={image.image_url} 
                            alt={`Aperçu PDF ${index + 1}`} 
                            // h-auto ensures the entire image perfectly scales without any cropping
                            className="w-full h-auto object-contain p-2 md:p-3 transform group-hover:scale-[1.02] transition-transform duration-1000 ease-out" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full aspect-[3/4] bg-stone-50 flex flex-col items-center justify-center text-stone-400">
                            <BookOpen size={32} className="mb-4 opacity-50" />
                            <span className="text-sm font-light">Image non disponible</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Mobile 3D Page Turn View */}
                  <div className="sm:hidden relative w-full px-6 mx-auto mt-6 mb-8 fade-up flex flex-col items-center">
                    <div 
                      className="relative w-full max-w-[320px] aspect-[4/5] cursor-pointer touch-pan-y"
                      style={{ perspective: '2000px' }}
                      onTouchStart={(e) => setPdfTouchStartX(e.touches[0].clientX)}
                      onTouchEnd={(e) => {
                        const touchEndX = e.changedTouches[0].clientX;
                        if (pdfTouchStartX - touchEndX > 50) setPdfFlipped(true); // Swipe Left (Turn to next)
                        if (touchEndX - pdfTouchStartX > 50) setPdfFlipped(false); // Swipe Right (Turn back)
                      }}
                      onClick={() => setPdfFlipped(!pdfFlipped)}
                    >
                      {/* Fake pages thickness behind the book */}
                      <div className="absolute inset-0 bg-[#e6e2dd] border border-stone-200/50 rounded-r-[1.5rem] rounded-l-sm transform translate-x-[4px] translate-y-[4px]"></div>
                      <div className="absolute inset-0 bg-[#f4f0ea] border border-stone-200/50 rounded-r-[1.5rem] rounded-l-sm transform translate-x-[2px] translate-y-[2px]"></div>

                      {/* Page 2 (Bottom Page - Revealed when turned) */}
                      <div className="absolute inset-0 bg-[#fefcfb] rounded-r-[1.5rem] rounded-l-sm shadow-sm border border-stone-200/80 overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-stone-300/40 via-stone-200/10 to-transparent z-10 pointer-events-none mix-blend-multiply"></div>
                        <div className="absolute inset-y-0 left-0 w-px bg-stone-300/50 z-10"></div>
                        {taobPdfImages[1]?.image_url ? (
                          <img src={taobPdfImages[1].image_url} alt="Aperçu PDF 2" className="w-full h-full object-contain p-3" referrerPolicy="no-referrer" />
                        ) : (
                           <div className="flex flex-col items-center opacity-30"><BookOpen size={32} /></div>
                        )}
                      </div>

                      {/* Page 1 (Top Page - Flippable) */}
                      <div 
                        className="absolute inset-0 bg-[#fefcfb] rounded-r-[1.5rem] rounded-l-sm shadow-md border border-stone-200/80 overflow-hidden origin-left flex items-center justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ 
                          transform: pdfFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        {/* Shadow simulating spine */}
                        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-stone-300/40 via-stone-200/10 to-transparent z-10 pointer-events-none mix-blend-multiply"></div>
                        <div className="absolute inset-y-0 left-0 w-px bg-stone-300/50 z-10"></div>
                        
                        {/* Page curl effect hint (bottom right corner) */}
                        {!pdfFlipped && <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-black/5 to-transparent z-10 rounded-br-[1.5rem] pointer-events-none"></div>}

                        {taobPdfImages[0]?.image_url ? (
                          <img src={taobPdfImages[0].image_url} alt="Aperçu PDF 1" className="w-full h-full object-contain p-3" referrerPolicy="no-referrer" />
                        ) : (
                           <div className="flex flex-col items-center opacity-30"><BookOpen size={32} /></div>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-400 font-medium mt-10 tracking-widest uppercase flex items-center gap-3">
                      <span className="w-4 h-px bg-stone-300"></span>
                      Tourner la page
                      <span className="w-4 h-px bg-stone-300"></span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full bg-white/40 border-2 border-stone-200/60 border-dashed rounded-[2rem] p-12 text-center fade-up flex flex-col items-center justify-center min-h-[350px]">
                  <BookOpen size={48} className="text-stone-300 mb-6" />
                  <h3 className="text-lg font-serif text-stone-600 mb-2">Espace réservé au Guide PDF</h3>
                  <p className="text-stone-400 font-light text-sm max-w-md mx-auto">C'est ici que s'afficheront les images du magnifique livret PDF accompagnant la formation.</p>
                </div>
              )}
            </section>

            {/* What you will learn */}
            <section id="chapitres-video" className="max-w-4xl mx-auto scroll-mt-32">
              <div className="text-center mb-12 fade-up">
                <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">Le Programme</h2>
                <p className="text-stone-500 font-light">Tout ce que vous allez apprendre dans cette formation</p>
              </div>
              
              <div className="pt-4 md:pt-8 fade-up">
                <div className="relative max-w-3xl mx-auto">
                  <h3 className="text-xl md:text-2xl font-serif text-stone-900 mb-8 md:mb-12 border-b border-stone-200 pb-4 text-center md:text-left">Chapitres vidéo</h3>
                  
                  <div className="relative space-y-4 md:space-y-6">
                    {[
                      { title: "Introduction", desc: "Petite présentation du contenu et aperçu global de la formation." },
                      { title: "Pourquoi la crème au beurre à la meringue suisse ?", desc: "On va voir les différents types de crèmes et pourquoi la crème au beurre à la meringue suisse est la plus adaptée pour la couverture des layer cakes." },
                      { title: "Bases générales et matériel", desc: "Les fondamentaux à maîtriser absolument ainsi que le matériel nécessaire pour la recette." },
                      { title: "Recette et méthode (avec robot pâtissier)", desc: "Ma recette détaillée et la méthode, étape par étape, avec les erreurs les plus courantes à éviter." },
                      { title: "Recette et méthode (avec batteur à mains)", desc: "Comment obtenir une texture tout aussi lisse et soyeuse sans robot pâtissier." },
                      { title: "Conservation de la crème au beurre", desc: "Règles de conservation, congélation et décongélation pour préserver une texture parfaite." },
                      { title: "Troubleshooting (résolution des problèmes)", desc: "Causes + solutions aux problèmes les plus fréquents avec la crème au beurre." }
                    ].map((item, index) => (
                      <div key={index} className="relative group transition-all duration-300 hover:-translate-y-1">
                        {/* Content Card */}
                        <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 p-6 md:p-8 rounded-[2rem] shadow-sm group-hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] group-hover:border-rose-100 transition-all duration-500 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-200 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out"></div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-3 lg:gap-4 mb-2 md:mb-3">
                              <span className="font-serif text-lg md:text-2xl text-rose-400 font-semibold">{String(index + 1).padStart(2, '0')}</span>
                              <h4 className="text-lg md:text-xl font-serif text-stone-800 leading-snug">{item.title}</h4>
                            </div>
                            <p className="text-sm md:text-base font-light text-stone-500 leading-relaxed max-w-2xl">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
            <section className="max-w-5xl mx-auto relative">
              {/* Success Modal */}
              {status === FormStatus.SUCCESS && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                  <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl text-center max-w-xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
                    <CheckCircle2 className="w-20 h-20 text-green-400 mb-6" />
                    <h2 className="text-3xl md:text-4xl font-serif mb-4 text-stone-900">Inscription Reçue !</h2>
                    <p className="text-stone-500 mb-8 leading-relaxed">
                      Merci de votre confiance. Nous allons vérifier votre paiement et nous reviendrons vers vous très bientôt pour vous donner accès à la formation.
                    </p>
                    <button 
                      onClick={() => setStatus(FormStatus.IDLE)}
                      className="bg-stone-900 text-white px-8 py-4 rounded-xl font-medium tracking-[0.2em] uppercase text-xs hover:bg-rose-400 transition-colors w-full"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-0">
                
                {/* Payment Info */}
                <div className="lg:col-span-2 bg-stone-900 text-white p-8 sm:p-10 lg:p-12 rounded-[2rem] lg:rounded-r-none relative z-10 shadow-sm fade-up">
                  <h2 className="text-2xl md:text-3xl font-serif mb-8 md:mb-10 text-rose-100">Paiement</h2>
                  
                  <div className="space-y-6 md:space-y-8">
                    <div>
                      <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-400 mb-1 md:mb-2">Montant à transférer</p>
                      <p className="text-xl md:text-2xl font-serif text-rose-300 bg-rose-900/40 inline-block px-4 py-2 rounded-xl border border-rose-800/50">2500 DA</p>
                    </div>

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
                <div className="lg:col-span-3 bg-white p-8 sm:p-10 lg:p-16 rounded-[2rem] lg:rounded-l-none border border-stone-100 shadow-sm lg:-ml-4 fade-up">
                  <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-2">Rejoindre la formation</h2>
                  <p className="text-sm md:text-base text-stone-500 font-light mb-8 md:mb-10">Remplissez ce formulaire après avoir effectué votre paiement.</p>
                  
                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        {status === FormStatus.ERROR && errorMessage && (
                          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
                            <AlertCircle size={18} />
                            {errorMessage}
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="name" className={`block text-xs uppercase tracking-widest mb-2 font-bold ${formErrors.name ? 'text-red-500' : 'text-stone-500'}`}>Nom complet</label>
                            <input type="text" id="name" value={formData.name} onChange={handleChange} className={`w-full bg-white border rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 transition-all font-light ${formErrors.name ? 'border-red-400 focus:ring-red-100' : 'border-stone-200 focus:ring-rose-100'}`} placeholder="Votre nom" required />
                          </div>
                          <div>
                            <label htmlFor="instagram" className={`block text-xs uppercase tracking-widest mb-2 font-bold ${formErrors.instagram ? 'text-red-500' : 'text-stone-500'}`}>Instagram Handle</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold select-none">@</span>
                              <input type="text" id="instagram" value={formData.instagram} onChange={handleChange} className={`w-full bg-white border rounded-xl pl-9 pr-4 py-3 text-stone-800 focus:outline-none focus:ring-2 transition-all font-light ${formErrors.instagram ? 'border-red-400 focus:ring-red-100' : 'border-stone-200 focus:ring-rose-100'}`} placeholder="votre_compte" required />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className={`block text-xs uppercase tracking-widest mb-2 font-bold ${formErrors.phone ? 'text-red-500' : 'text-stone-500'}`}>Numéro de téléphone</label>
                          <input type="tel" id="phone" value={formData.phone} onChange={handleChange} className={`w-full bg-white border rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 transition-all font-light ${formErrors.phone ? 'border-red-400 focus:ring-red-100' : 'border-stone-200 focus:ring-rose-100'}`} placeholder="Ex: 0555123456" maxLength={10} required />
                        </div>
                        
                        <div className="mb-8">
                          <label className={`block text-xs uppercase tracking-widest mb-2 font-bold ${formErrors.proofFile ? 'text-red-500' : 'text-stone-500'}`}>Preuve de paiement (photo)</label>
                          <div 
                            onClick={() => !previewUrl && fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden ${
                              previewUrl 
                                ? 'border-rose-200 bg-white h-48' 
                                : formErrors.proofFile 
                                  ? 'border-red-300 bg-red-50/10 hover:bg-red-50 h-32'
                                  : 'border-stone-200 bg-white hover:border-rose-300 hover:bg-rose-50/30 h-32'
                            }`}
                          >
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            
                            {previewUrl ? (
                              <div className="relative w-full h-full group">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                  className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-2">
                                  <Upload size={20} />
                                </div>
                                <p className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold text-center px-4">Upload de la preuve</p>
                                <p className="text-[9px] text-stone-300 mt-1">preuve du virement</p>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <button disabled={status === FormStatus.SUBMITTING} type="submit" className="w-full mt-4 bg-stone-900 text-white py-5 rounded-xl font-medium tracking-[0.2em] uppercase text-sm hover:bg-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                          {status === FormStatus.SUBMITTING ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Envoi en cours...
                            </span>
                          ) : (
                            "Soumettre l'inscription"
                          )}
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
