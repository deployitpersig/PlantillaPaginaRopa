import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Grid layout patterns for 5 cards
const LAYOUT = [
  'col-span-12 md:col-span-6',
  'col-span-12 md:col-span-6',
  'col-span-12 md:col-span-4',
  'col-span-12 md:col-span-5',
  'col-span-12 md:col-span-3',
];

const Styles = () => {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopSubcategories = async () => {
      try {
        // Fetch all products that have a subcategory
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

        // Group by subcategory and sum sold_count
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
          // Prefer a product image that has sold more
          if ((p.sold_count || 0) > 0 && p.image) {
            subcatMap[sub].image = p.image;
          }
        });

        // Sort by total sold_count descending, take top 5
        const sorted = Object.values(subcatMap)
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, 5)
          .map((item, i) => ({
            ...item,
            colSpan: LAYOUT[i] || LAYOUT[LAYOUT.length - 1],
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
    // Determine the category slug for the route
    const cat = (style.category || '').toLowerCase();
    let slug = 'mens';
    if (cat.includes('women')) slug = 'womens';
    else if (cat.includes('kid')) slug = 'kids';
    else if (cat.includes('men')) slug = 'mens';

    // Navigate to category page — the subcategory filter will be available as pills
    navigate(`/category/${slug}`);
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 w-full flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto flex-shrink-0 section-snap">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Browse by Dress Style</h2>
        <div className="grid grid-cols-12 gap-4 auto-rows-[140px] md:auto-rows-[180px] bg-gray-100 p-6 rounded-3xl w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`bg-gray-200 rounded-2xl animate-pulse ${LAYOUT[i - 1]}`} />
          ))}
        </div>
      </section>
    );
  }

  if (styles.length === 0) return null;

  return (
    <section className="py-16 md:py-24 w-full flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto flex-shrink-0 section-snap">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Browse by Dress Style</h2>
      
      <div className="grid grid-cols-12 gap-4 auto-rows-[140px] md:auto-rows-[180px] bg-gray-100 p-6 rounded-3xl w-full">
        {styles.map((style, index) => (
          <div 
            key={style.title} 
            className={`relative bg-white rounded-2xl overflow-hidden group cursor-pointer ${style.colSpan}`}
            onClick={() => handleClick(style)}
          >
            {/* Title positioning */}
            <div className="absolute top-6 left-6 z-10">
              <h3 className="text-xl md:text-2xl font-bold">{style.title}</h3>
              <p className="text-gray-500 text-xs md:text-sm flex items-center gap-1 mt-1 group-hover:text-black transition-colors">
                Explore <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </p>
            </div>
            
            {/* Image */}
            <div className="absolute bottom-0 right-0 w-2/3 h-4/5">
              <img 
                src={style.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'} 
                alt={style.title} 
                className="w-full h-full object-contain object-bottom md:object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Styles;
