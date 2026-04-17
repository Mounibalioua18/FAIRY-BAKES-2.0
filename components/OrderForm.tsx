
import React, { useState, useRef } from 'react';
import { Send, CheckCircle2, AlertCircle, Info, Upload, X } from 'lucide-react';
import { FormStatus, CakeOrder } from '../types';
import { supabase } from '../lib/supabase';

export const OrderForm: React.FC = () => {
  const [status, setStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate next month's boundaries
  const now = new Date();
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const lastDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  
  const monthName = nextMonthDate.toLocaleString('default', { month: 'long' });
  const year = nextMonthDate.getFullYear();
  
  const minDate = nextMonthDate.toISOString().split('T')[0];
  const maxDate = lastDayNextMonth.toISOString().split('T')[0];

  const [formData, setFormData] = useState<CakeOrder>({
    customerName: '',
    phoneNumber: '',
    instagramHandle: '',
    eventDate: minDate,
    cakeSize: '15cm',
    flavor: 'Vanille',
    inspiration: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(FormStatus.SUBMITTING);
    setErrorMessage(null);

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
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: formData.customerName,
            phone_number: formData.phoneNumber,
            instagram_handle: formData.instagramHandle,
            event_date: formData.eventDate,
            cake_size: formData.cakeSize,
            flavor: formData.flavor
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create entry in 'galleries' table if image exists
      if (finalFileUrl && orderData) {
        const { error: galleryError } = await supabase
          .from('galleries')
          .insert([
            {
              order_id: orderData.id,
              images: [finalFileUrl]
            }
          ]);
          
        if (galleryError) throw galleryError;
      }

      setStatus(FormStatus.SUCCESS);
      setPreviewUrl(null);
      setSelectedFile(null);
      setFormData({
        customerName: '',
        phoneNumber: '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("File is too large. Max 50MB.");
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

  if (status === FormStatus.SUCCESS) {
    return (
      <section id="order" className="py-24 px-6 md:px-12 bg-rose-50 text-center scroll-mt-24">
        <div className="max-w-2xl mx-auto py-20 bg-white rounded-[3rem] shadow-xl px-10">
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-4xl font-serif mb-4">Commande Reçue!</h2>
          <p className="text-stone-500 mb-8">
            Thank you for trusting Fairy Bakes. We will reach out via Instagram within 48 hours to confirm your {monthName} slot and discuss final details.
          </p>
          <button 
            onClick={() => setStatus(FormStatus.IDLE)}
            className="text-rose-500 font-semibold uppercase tracking-widest text-sm hover:underline"
          >
            Submit another order
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="order" className="py-24 px-6 md:px-12 bg-white scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6">Reservation Window</h2>
            <div className="inline-flex items-center space-x-2 bg-stone-900 text-white px-4 py-2 rounded-full text-xs uppercase tracking-widest mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>Accepting Orders for {monthName} {year}</span>
            </div>
            <p className="text-stone-500 text-lg mb-8 leading-relaxed font-light">
              We gather orders once a month. This ensures we can source the freshest seasonal florals and plan each design meticulously.
            </p>
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                <AlertCircle className="text-rose-400 flex-shrink-0" size={24} />
                <p className="text-sm text-stone-600 leading-relaxed italic">
                  Note: A 50% deposit via Baridimob or CCP is required within 48h to secure your date. Dates are reserved on a first-to-pay basis.
                </p>
              </div>
              <div className="flex items-start space-x-4 p-4">
                <Info className="text-stone-300 flex-shrink-0" size={20} />
                <p className="text-xs text-stone-400">Delivery is available in Algiers (Alger) only.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-stone-50 p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100">
            {status === FormStatus.ERROR && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Name</label>
                <input 
                  required
                  type="text" 
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Phone</label>
                <input 
                  required
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0..."
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Instagram Handle</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold select-none">@</span>
                <input 
                  required
                  type="text" 
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold">Event Date</label>
                  <span className="text-[10px] text-rose-400 font-semibold uppercase">{monthName} Only</span>
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
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer hover:border-rose-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Size</label>
                <select 
                  name="cakeSize"
                  value={formData.cakeSize}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="12cm">12cm (Small)</option>
                  <option value="15cm">15cm (Standard)</option>
                  <option value="20cm">20cm (Large)</option>
                  <option value="custom">Custom (Wedding/Engagement)</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Flavor Preference</label>
              <select 
                name="flavor"
                value={formData.flavor}
                onChange={handleChange}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all appearance-none cursor-pointer"
              >
                <option value="Vanille">Vanille</option>
                <option value="Chocolat">Chocolat</option>
                <option value="Vanille Fraise">Vanille Fraise</option>
                <option value="Pistache Framboise">Pistache Framboise</option>
                <option value="Other">Other (Discuss later)</option>
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Inspiration</label>
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
                    <p className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold text-center px-4">upload your inspiration</p>
                    <p className="text-[9px] text-stone-300 mt-1">JPEG, PNG up to 50MB</p>
                  </>
                )}
              </div>
            </div>

            <button 
              disabled={status === FormStatus.SUBMITTING}
              type="submit" 
              className="w-full bg-rose-400 text-white rounded-full py-4 uppercase tracking-[0.2em] text-sm font-semibold hover:bg-rose-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === FormStatus.SUBMITTING ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending Order...
                </span>
              ) : (
                <>
                  <span>Pre-Order for {monthName}</span>
                  <Send size={16} />
                </>
              )}
            </button>
            <p className="mt-4 text-[10px] text-center text-stone-400 uppercase tracking-widest">Algiers Delivery Only • 50% Deposit Required</p>
          </form>
        </div>
      </div>
    </section>
  );
};