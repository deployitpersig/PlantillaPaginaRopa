import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Grid layout patterns for 5 cards:
// On mobile (grid-cols-2): 1st is full width, next 4 are half width (2x2) -> 3 rows total.
// On desktop (grid-cols-12): Original custom spans.
const LAYOUT = [
  'col-span-2 md:col-span-6',
  'col-span-2 md:col-span-6',
  'col-span-2 md:col-span-4',
  'col-span-2 md:col-span-5',
  'col-span-2 md:col-span-3',
];

// Refined mobile layout so it doesn't overflow 100vh
const MOBILE_LAYOUT = [
  'col-span-2', // Row 1: Full width
  'col-span-1', // Row 2: Half width
  'col-span-1', // Row 2: Half width
  'col-span-1', // Row 3: Half width
  'col-span-1', // Row 3: Half width
];

const DESKTOP_LAYOUT = [
  'md:col-span-6',
  'md:col-span-6',
  'md:col-span-4',
  'md:col-span-5',
  'md:col-span-3',
];

const Styles = () => {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopSubcategories = async () => {
      try {
        const { data: products, error } = await supabase
          .from('products')
          .select('subcategory, category, image, sold_count')
          .not('subcategory', 'is', null)
          .neq('subcategory', '');

        if (error || !products) {
          setStyles([]);
          setLoading(false);
          return;
        }

        const subcatMap = {};
        products.forEach((p) => {
          const sub = p.subcategory;
          if (!sub) return;
          if (!subcatMap[sub]) {
            subcatMap[sub] = {
              title: sub,
              category: p.category,
              image: p.image,
              totalSold: 0,
            };
          }
          subcatMap[sub].totalSold += (p.sold_count || 0);
          if ((p.sold_count || 0) > 0 && p.image) {
            subcatMap[sub].image = p.image;
          }
        });

        const sorted = Object.values(subcatMap)
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, 5)
          .map((item, i) => ({
            ...item,
            colSpan: `${MOBILE_LAYOUT[i] || 'col-span-2'} ${DESKTOP_LAYOUT[i] || 'md:col-span-12'}`,
          }));

        setStyles(sorted);
      } catch {
        setStyles([]);
      }
      setLoading(false);
    };

    fetchTopSubcategories();
  }, []);

  const handleClick = (style) => {
    const cat = (style.category || '').toLowerCase();
    let slug = 'mens';
    if (cat.includes('women')) slug = 'womens';
    else if (cat.includes('kid')) slug = 'kids';
    else if (cat.includes('men')) slug = 'mens';

    navigate(`/category/${slug}`, { state: { subcategory: style.title } });
  };

  if (loading) {
    return (
      <section className="w-full min-h-[100dvh] flex flex-col justify-center py-16 md:py-24 section-snap relative">
        <div className="w-full px-4 md:px-12 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Browse by Dress Style</h2>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-4 auto-rows-[140px] md:auto-rows-[180px] bg-gray-100 p-4 md:p-6 rounded-3xl w-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`bg-gray-200 rounded-2xl animate-pulse ${MOBILE_LAYOUT[i - 1]} ${DESKTOP_LAYOUT[i - 1]}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (styles.length === 0) return null;

  return (
    <section className="w-full min-h-[100dvh] flex flex-col justify-center py-16 md:py-24 section-snap relative">
      <div className="w-full px-4 md:px-12 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Browse by Dress Style</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 auto-rows-[140px] md:auto-rows-[180px] bg-gray-100 p-4 md:p-6 rounded-3xl w-full">
          {styles.map((style) => (
            <div 
              key={style.title} 
              className={`relative bg-white rounded-2xl overflow-hidden group cursor-pointer ${style.colSpan}`}
              onClick={() => handleClick(style)}
            >
              <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                <h3 className="text-lg md:text-2xl font-bold">{style.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm flex items-center gap-1 mt-1 group-hover:text-black transition-colors">
                  Explore <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </p>
              </div>
              
              <div className="absolute right-0 top-0 h-full w-2/3 md:w-1/2 flex items-center justify-end md:justify-center p-4 md:p-6 pointer-events-none">
                <img 
                  src={style.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'} 
                  alt={style.title} 
                  className="w-full h-full object-contain object-right md:object-center group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Styles;
