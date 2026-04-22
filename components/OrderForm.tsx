import React, { useState, useRef } from 'react';
import { Send, CheckCircle2, AlertCircle, Info, Upload, X } from 'lucide-react';
import { FormStatus, CakeOrder } from '../types';
import { supabase } from '../lib/supabase';

export const OrderForm: React.FC = () => {
  const [status, setStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<{phoneNumber?: boolean}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch form status setting
  React.useEffect(() => {
    const fetchFormStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('description')
          .eq('title', 'SYSTEM_SETTING_ORDER_FORM')
          .single();
        
        if (data && data.description === 'false') {
          setIsFormOpen(false);
        }
      } catch (err) {
        console.log('Using default form setting');
      }
    };
    fetchFormStatus();
  }, []);

  // Calculate next month's boundaries
  const now = new Date();
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const lastDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  
  const monthName = nextMonthDate.toLocaleString('default', { month: 'long' });
  const year = nextMonthDate.getFullYear();
  
  // Helper to format date in local time YYYY-MM-DD avoiding UTC offset issues
  const toLocalISOString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const minDate = toLocalISOString(nextMonthDate);
  const maxDate = toLocalISOString(lastDayNextMonth);

  const [formData, setFormData] = useState<CakeOrder>({
    customerName: '',
    phoneNumber: '0',
    instagramHandle: '',
    eventDate: minDate,
    cakeSize: '15cm',
    flavor: 'Vanille',
    inspiration: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const errors: any = {};
    if (!/^0[0-9]{9}$/.test(formData.phoneNumber)) errors.phoneNumber = true;

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setStatus(FormStatus.SUBMITTING);

    try {
      let finalFileUrl: string | null = null;

      // 1. Upload Image to Storage if exists
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('inspirations')
          .upload(filePath, selectedFile);
          
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('inspirations')
          .getPublicUrl(filePath);

        finalFileUrl = publicUrl;
      }

      // 2. Create the main Order Document
      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: formData.customerName,
            phone_number: formData.phoneNumber,
            instagram_handle: formData.instagramHandle,
            event_date: formData.eventDate,
            cake_size: formData.cakeSize,
            flavor: formData.flavor,
            inspiration_image_url: finalFileUrl
          }
        ]);

      if (orderError) throw orderError;

      setStatus(FormStatus.SUCCESS);
      setPreviewUrl(null);
      setSelectedFile(null);
      setFormData({
        customerName: '',
        phoneNumber: '0',
        instagramHandle: '',
        eventDate: minDate,
        cakeSize: '15cm',
        flavor: 'Vanille',
        inspiration: ''
      });
    } catch (error: any) {
      console.error('Supabase error:', error);
      setStatus(FormStatus.ERROR);
      setErrorMessage(error.message || 'Something went wrong. Please check your connection.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') setFormErrors(prev => ({ ...prev, phoneNumber: false }));

    if (name === 'phoneNumber') {
      let val = value.replace(/\D/g, '');
      if (val.length > 0 && val[0] !== '0') {
        val = '0' + val;
      }
      if (val.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: val }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        alert("L'image est trop volumineuse (Max 20MB).");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      if ('showPicker' in e.currentTarget) {
        (e.currentTarget as any).showPicker();
      }
    } catch (error) {
      console.debug('Native picker not supported');
    }
  };

  return (
    <>
      {/* Success Modal */}
      {status === FormStatus.SUCCESS && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300" style={{position: 'fixed'}}>
          <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl text-center max-w-xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-20 h-20 text-green-400 mb-6" />
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-stone-900">Commande Reçue !</h2>
            <p className="text-stone-500 mb-8 leading-relaxed">
              Merci de votre confiance. Nous vous contacterons via Instagram sous 48 heures pour confirmer votre créneau pour {monthName} et discuter des détails.
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

      <section id="order" className="py-12 md:py-16 px-6 md:px-12 bg-white scroll-mt-24 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-stone-900 mb-4 md:mb-6">Créneaux de Réservation</h2>
            <div className="inline-flex items-center space-x-2 bg-stone-900 text-white px-3 md:px-4 py-2 rounded-full text-[10px] md:text-xs uppercase tracking-widest mb-6 md:mb-8">
              <span className={`w-2 h-2 rounded-full ${isFormOpen ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></span>
              <span>{isFormOpen ? `Commandes ouvertes pour ${monthName} ${year}` : 'Commandes fermées'}</span>
            </div>
            <p className="text-stone-500 text-sm md:text-lg mb-6 md:mb-8 leading-relaxed font-light">
              Nous recueillons les commandes une fois par mois. Cela nous permet de sélectionner les fleurs de saison les plus fraîches et de planifier méticuleusement chaque design.
            </p>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start space-x-3 md:space-x-4 p-4 md:p-6 bg-rose-50 rounded-2xl border border-rose-100">
                <AlertCircle className="text-rose-400 flex-shrink-0" size={20} />
                <p className="text-xs md:text-sm text-stone-600 leading-relaxed italic">
                  Note : Un acompte de 50% via Baridimob ou CCP est requis sous 48h pour bloquer votre date. Premier payé, premier servi.
                </p>
              </div>
              <div className="flex items-start space-x-3 md:space-x-4 px-2 md:px-4">
                <Info className="text-stone-300 flex-shrink-0" size={16} />
                <p className="text-[10px] md:text-xs text-stone-400">La livraison est disponible uniquement à Alger.</p>
              </div>
            </div>
          </div>

          {!isFormOpen ? (
            <div className="bg-stone-50 p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center h-full">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                <AlertCircle className="text-rose-400" size={32} />
              </div>
              <h3 className="text-2xl font-serif text-stone-900 mb-4">Les commandes sont fermées</h3>
              <p className="text-stone-600 leading-relaxed max-w-sm mx-auto">
                Les commandes ouvriront vers la fin du mois. Gardez un œil sur notre Instagram pour être informé(e) !
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-stone-50 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-stone-100 relative overflow-hidden text-sm">
              {/* Honeypot field (hidden from users) */}
              <input type="text" name="bot_field_website" className="hidden" tabIndex={-1} autoComplete="off" />

              {status === FormStatus.ERROR && (
                <div className="mb-3 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-1 font-bold">Nom</label>
                  <input 
                    required
                    type="text" 
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Votre Nom"
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>
                <div>
                  <label className={`block text-[9px] uppercase tracking-widest mb-1 font-bold ${formErrors.phoneNumber ? 'text-red-500' : 'text-stone-500'}`}>Téléphone</label>
                  <input 
                    required
                    type="tel" 
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    maxLength={10}
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 transition-all ${formErrors.phoneNumber ? 'border-red-400 focus:ring-red-100' : 'border-stone-200 focus:ring-rose-100'}`}
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-red-500 text-[8px] mt-0.5 uppercase font-medium tracking-wide">Le numéro est faux</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col justify-end">
                  <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-1 font-bold">Instagram</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 font-bold select-none text-xs">@</span>
                    <input 
                      required
                      type="text" 
                      name="instagramHandle"
                      value={formData.instagramHandle}
                      onChange={handleChange}
                      placeholder="votre_compte"
                      className="w-full bg-white border border-stone-200 rounded-lg pl-7 pr-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col justify-end">
                  <div className="flex justify-between items-end mb-1 gap-1">
                    <label className="block text-[9px] uppercase tracking-widest text-stone-500 font-bold leading-none pb-0.5">Date</label>
                    <span className="text-[8px] text-rose-400 font-semibold uppercase text-right leading-none pb-0.5 whitespace-nowrap">{monthName} Uniquement</span>
                  </div>
                  <div className="relative">
                    <input 
                      required
                      type="date" 
                      name="eventDate"
                      min={minDate}
                      max={maxDate}
                      value={formData.eventDate}
                      onChange={handleChange}
                      onClick={handleDateClick}
                      onKeyDown={(e) => e.preventDefault()}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer hover:border-rose-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col justify-end">
                  <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-1 font-bold leading-none">Taille</label>
                  <select 
                    name="cakeSize"
                    value={formData.cakeSize}
                    onChange={handleChange}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all appearance-none cursor-pointer"
                  >
                    <option value="12cm">12cm</option>
                    <option value="15cm">15cm</option>
                    <option value="20cm">20cm</option>
                    <option value="custom">Sur mesure</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-1 font-bold leading-none">Saveur</label>
                  <select 
                    name="flavor"
                    value={formData.flavor}
                    onChange={handleChange}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Vanille">Vanille</option>
                    <option value="Chocolat">Chocolat</option>
                    <option value="Vanille Fraise">Vanille Fraise</option>
                    <option value="Pistache Framboise">Pist./Fram.</option>
                    <option value="Other">Autre</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-1 font-bold">Inspiration (Max 50MB)</label>
                <div 
                  onClick={() => !previewUrl && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-lg transition-all flex flex-col items-center justify-center p-2 cursor-pointer overflow-hidden ${
                    previewUrl ? 'border-rose-200 bg-white h-20' : 'border-stone-200 bg-white hover:border-rose-300 hover:bg-rose-50/30 h-16'
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
                        className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors z-20"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                        <Upload size={16} />
                      </div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">joindre une image</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={status === FormStatus.SUBMITTING}
                type="submit" 
                className="w-full bg-rose-400 text-white rounded-lg py-3 uppercase tracking-[0.2em] text-[10px] md:text-xs font-semibold hover:bg-rose-500 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === FormStatus.SUBMITTING ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Envoi...
                  </span>
                ) : (
                  <>
                    <span>Pré-commander ({monthName})</span>
                    <Send size={12} />
                  </>
                )}
              </button>
              <p className="mt-2 text-[8px] md:text-[9px] text-center text-stone-400 uppercase tracking-widest">Alger Uniquement • 50% d'Acompte Requis</p>
            </form>
          )}
          </div>
        </div>
      </section>
    </>
  );
};
