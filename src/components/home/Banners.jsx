import React from 'react';

const Banners = () => {
  return (
    <section className="w-full flex flex-col md:flex-row h-auto md:h-[500px]">
      {/* Left Banner - New Arrivals */}
      <div className="relative w-full md:w-1/2 h-[400px] md:h-full bg-gray-900 overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&q=80&w=1000" 
          alt="New Arrivals in streetwear"
          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">New Arrivals</h2>
          <p className="max-w-md text-gray-200 text-sm mb-8">
            Urban vibes, timeless style. Uncompromised craftsmanship for the modern aesthetic.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-black px-6 py-2 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
            <button className="bg-transparent border border-white text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-white/10 transition-colors">
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* Right Banner - Accessories */}
      <div className="relative w-full md:w-1/2 h-[400px] md:h-full bg-[#5a3a29] overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=1000" 
          alt="Premium Leather Accessories" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Accessories</h2>
          <p className="max-w-md text-gray-200 text-sm mb-8">
            Complete your look with our meticulously crafted accessories. The perfect blend of form and function.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-black px-6 py-2 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
            <button className="bg-transparent border border-white text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-white/10 transition-colors">
              Explore
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banners;
