import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
          .slice(0, 5); // Keep top 5 or let it be dynamic

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
      <section className="w-full py-16 md:py-24 relative">
        <div className="w-full px-4 md:px-12 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Browse by Dress Style</h2>
          <div 
            className="grid gap-4 bg-gray-100 p-4 md:p-6 rounded-3xl w-full"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-200 rounded-2xl animate-pulse h-[200px] md:h-[240px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (styles.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24 relative">
      <div className="w-full px-4 md:px-12 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Browse by Dress Style</h2>
        
        <div 
          className="grid gap-4 bg-gray-100 p-4 md:p-6 rounded-3xl w-full"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          {styles.map((style) => (
            <div 
              key={style.title} 
              className="relative bg-white rounded-2xl overflow-hidden group cursor-pointer h-[200px] md:h-[240px] flex-shrink-0 flex flex-col justify-end"
              onClick={() => handleClick(style)}
            >
              {/* Image Container taking full background */}
              <div className="absolute inset-0 w-full h-full p-6">
                <img 
                  src={style.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'} 
                  alt={style.title} 
                  className="w-full h-full object-contain object-right md:object-center group-hover:scale-110 transition-transform duration-500 opacity-90"
                />
              </div>

              {/* Title positioning - Added background gradient to protect text visibility against images */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 z-10 pointer-events-none" />
              
              <div className="relative z-20 p-6 flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">{style.title}</h3>
                <p className="text-gray-100 font-semibold text-xs md:text-sm flex items-center gap-1 mt-1 group-hover:text-white transition-colors drop-shadow-md">
                  Explore <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Styles;
