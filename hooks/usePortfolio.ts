import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface PortfolioItem {
  id: string;
  type: 'main' | 'gallery';
  title: string;
  description: string;
  image_url: string;
  position: number;
}

const DEFAULT_MAIN: PortfolioItem = {
  id: 'main',
  type: 'main',
  title: 'Midnight Navy Ruffle',
  description: 'Featured Art',
  image_url: '',
  position: 0
};

const DEFAULT_GALLERY: PortfolioItem[] = [
  { id: '1', title: 'Cottage Matcha Meadow', description: 'Fairy Garden', image_url: '', type: 'gallery', position: 1 }, 
  { id: '2', title: 'Alabaster Petal Muse', description: 'Ethereal', image_url: '', type: 'gallery', position: 2 }, 
  { id: '3', title: 'Floral Tapestry', description: 'Botanical', image_url: '', type: 'gallery', position: 3 }, 
  { id: '4', title: 'Rosewood Enchantment', description: 'Vintage', image_url: '', type: 'gallery', position: 4 },
  { id: '5', title: 'Celestial Silk Tier', description: 'Grand Celebration', image_url: '', type: 'gallery', position: 5 },
  { id: '6', title: 'Ethereal Garden Whispers', description: 'Artisan Signature', image_url: '', type: 'gallery', position: 6 },
];

const DEFAULT_PROCESS: PortfolioItem[] = [
  { id: '7', title: 'Process 1', description: '', image_url: '', type: 'gallery', position: 7 },
  { id: '8', title: 'Process 2', description: '', image_url: '', type: 'gallery', position: 8 }
];

const DEFAULT_TAOB: PortfolioItem[] = [
  { id: '9', title: 'TAOB Apercu 1', description: '', image_url: '', type: 'gallery', position: 9 },
  { id: '10', title: 'TAOB Apercu 2', description: '', image_url: '', type: 'gallery', position: 10 },
  { id: '11', title: 'TAOB Apercu 3', description: '', image_url: '', type: 'gallery', position: 11 }
];

export function usePortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('*')
          .order('position', { ascending: true });
        
        if (error) {
          console.error("Error fetching portfolio:", error);
        } else {
          setItems(data || []);
        }
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPortfolio();
  }, []);

  const getDbImage = (type: string, position: number, fallback: PortfolioItem) => {
    const dbItem = items.find(item => item.type === type && item.position === position);
    if (dbItem && dbItem.image_url && dbItem.image_url.trim() !== '') {
      return dbItem;
    }
    return fallback;
  };

  const getMainImage = () => getDbImage('main', 0, DEFAULT_MAIN);

  const getGalleryImages = () => {
    return DEFAULT_GALLERY.map((fallback, index) => getDbImage('gallery', index + 1, fallback));
  };

  const getProcessImages = () => {
    return DEFAULT_PROCESS.map((fallback, index) => getDbImage('gallery', index + 7, fallback));
  };

  const getTaobImages = () => {
    return DEFAULT_TAOB.map((fallback, index) => getDbImage('gallery', index + 9, fallback));
  };

  return { 
    mainImage: getMainImage(), 
    galleryImages: getGalleryImages(), 
    processImages: getProcessImages(), 
    taobImages: getTaobImages(),
    loading 
  };
}
