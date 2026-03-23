import React from 'react';

const MidBanner = () => {
  return (
    <section className="w-full relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1512353087810-254e04f67c42?auto=format&fit=crop&q=80&w=1200" 
        alt="Models on sports court in streetwear" 
        className="absolute inset-0 w-full h-full object-cover object-top opacity-80"
      />
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 text-center text-white px-6 flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-8 max-w-2xl leading-tight">
          Effortless Style,<br />Every Step of the Way you take
        </h2>
        <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
          View Collection
        </button>
      </div>
    </section>
  );
};

export default MidBanner;
