import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { Check, Play, BookOpen, Infinity, MessageCircle, Send, Copy, AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FormStatus } from '../types';
import { usePortfolio } from '../hooks/usePortfolio';

gsap.registerPlugin(ScrollTrigger);

export const TAOB: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const { taobImages } = usePortfolio();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedBaridi, setCopiedBaridi] = useState(false);
  const [copiedCCP, setCopiedCCP] = useState(false);
  
  const [status, setStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', instagram: '', phone: '0' });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    
    if (!/^0[0-9]{9}$/.test(formData.phone)) {
      setErrorMessage("Le numéro de téléphone doit contenir exactement 10 chiffres et commencer par un '0'.");
      return;
    }

    if (!proofFile) {
      setErrorMessage("Veuillez uploader la preuve de paiement / Capture d'écran du virement.");
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
        
        <main className="pt-48 md:pt-56 pb-32 px-6 md:px-12 max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16 md:mb-24 fade-up">
            <h1 className="flex flex-col items-center justify-center mb-6 md:mb-8">
              <span className="font-serif text-rose-400 text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide relative z-10">The Art Of</span>
              <span className="font-signature text-rose-400 text-6xl sm:text-8xl md:text-[10rem] leading-none -mt-4 sm:-mt-6 md:-mt-8 relative z-0">Buttercream</span>
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

            {/* Aperçu Gallery */}
            <section className="max-w-5xl mx-auto mt-16 md:mt-24">
              <div className="text-center mb-8 md:mb-12 fade-up">
                <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">Aperçu de la formation</h2>
                <p className="text-stone-500 font-light">Un regard sur ce qui vous attend à l'intérieur</p>
              </div>
              <div className="relative px-2 md:px-4 max-w-5xl mx-auto pb-4 md:pb-28">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                  {taobImages.map((image, index) => {
                    // Mobile: Bento box (1st wide, next 2 squares)
                    // Desktop: Stair-step (1st low, 2nd mid, 3rd high)
                    let placementClasses = '';
                    if (index === 0) {
                      placementClasses = 'col-span-2 aspect-[4/3] md:col-span-1 md:aspect-[3/4] md:translate-y-24';
                    } else if (index === 1) {
                      placementClasses = 'col-span-1 aspect-square md:col-span-1 md:aspect-[3/4] md:translate-y-12';
                    } else if (index === 2) {
                      placementClasses = 'col-span-1 aspect-square md:col-span-1 md:aspect-[3/4] md:translate-y-0';
                    } else {
                      placementClasses = 'col-span-2 md:col-span-1 aspect-square md:aspect-[3/4]';
                    }

                    return (
                      <div 
                        key={image.id || index} 
                        className={`fade-up rounded-xl md:rounded-[2rem] shadow-xl overflow-hidden w-full ${placementClasses}`}
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
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-2xl bg-rose-200/20 rounded-full blur-[100px] pointer-events-none"></div>
              </div>
            </section>

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
              {status === FormStatus.SUCCESS ? (
                <div className="min-h-[80vh] flex flex-col items-center justify-center fade-up mt-4 md:mt-8">
                  <div className="bg-white p-12 lg:p-20 rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-stone-100 text-center max-w-2xl w-full flex flex-col items-center">
                    <CheckCircle2 className="w-20 h-20 text-green-400 mb-6" />
                    <h2 className="text-3xl md:text-4xl font-serif mb-4 text-stone-900">Inscription Reçue !</h2>
                    <p className="text-stone-500 mb-10 leading-relaxed max-w-md mx-auto">
                      Merci de votre confiance. Nous allons vérifier votre paiement et nous reviendrons vers vous très bientôt pour vous donner accès à la formation.
                    </p>
                    <button 
                      onClick={() => setStatus(FormStatus.IDLE)}
                      className="bg-stone-900 text-white px-8 py-4 rounded-xl font-medium tracking-[0.2em] uppercase text-xs hover:bg-rose-400 transition-colors"
                    >
                      Nouvelle Inscription
                    </button>
                  </div>
                </div>
              ) : (
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

                    <div>
                      <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-400 mb-1 md:mb-2">Montant à transférer</p>
                      <p className="text-xl md:text-2xl font-serif text-rose-300 bg-rose-900/40 inline-block px-4 py-2 rounded-xl border border-rose-800/50">2500 DA</p>
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
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                        {status === FormStatus.ERROR && (
                          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
                            <AlertCircle size={18} />
                            {errorMessage}
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="name" className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Nom complet</label>
                            <input type="text" id="name" value={formData.name} onChange={handleChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all font-light" placeholder="Votre nom" required />
                          </div>
                          <div>
                            <label htmlFor="instagram" className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Instagram Handle</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold select-none">@</span>
                              <input type="text" id="instagram" value={formData.instagram} onChange={handleChange} className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all font-light" placeholder="votre_compte" required />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Numéro de téléphone</label>
                          <input type="tel" id="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all font-light" placeholder="Ex: 0555123456" maxLength={10} required />
                        </div>
                        
                        <div className="mb-8">
                          <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Preuve de paiement (photo)</label>
                          <div 
                            onClick={() => !previewUrl && fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden ${
                              previewUrl ? 'border-rose-200 bg-white h-48' : 'border-stone-200 bg-white hover:border-rose-300 hover:bg-rose-50/30 h-32'
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
              )}
            </section>

          </div>
        </main>
        
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
};
