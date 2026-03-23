import React from 'react';
import { ArrowRight } from 'lucide-react';

const styles = [
  {
    title: 'Casual',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=500',
    colSpan: 'col-span-12 md:col-span-6',
  },
  {
    title: 'Women',
    image: 'https://images.unsplash.com/photo-1434389678232-23b0f51608d1?auto=format&fit=crop&q=80&w=500',
    colSpan: 'col-span-12 md:col-span-6',
  },
  {
    title: 'Accessories',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=500',
    colSpan: 'col-span-12 md:col-span-4',
  },
  {
    title: 'Active',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=500',
    colSpan: 'col-span-12 md:col-span-5',
  },
  {
    title: 'Summer',
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=500',
    colSpan: 'col-span-12 md:col-span-3',
  }
];

const Styles = () => {
  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center">Browse by Dress Style</h2>
      
      <div className="grid grid-cols-12 gap-4 auto-rows-[250px] bg-gray-100 p-8 rounded-3xl">
        {styles.map((style, index) => (
          <div 
            key={index} 
            className={`relative bg-white rounded-2xl overflow-hidden group cursor-pointer ${style.colSpan}`}
          >
            {/* Title positioning mimicking the original layout */}
            <div className="absolute top-6 left-6 z-10">
              <h3 className="text-2xl font-bold">{style.title}</h3>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1 group-hover:text-black transition-colors">
                Explore <ArrowRight className="w-4 h-4" />
              </p>
            </div>
            
            {/* Image placed creatively */}
            <div className="absolute bottom-0 right-0 w-2/3 h-4/5">
              <img 
                src={style.image} 
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
