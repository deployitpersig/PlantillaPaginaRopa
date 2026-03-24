import React from 'react';
import { useNavigate } from 'react-router-dom';

const Banners = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full flex flex-col md:flex-row h-auto md:h-screen section-snap">
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
          <button 
            onClick={() => navigate('/category/new-arrivals')}
            className="bg-white text-black px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* Right Banner - Sale */}
      <div className="relative w-full md:w-1/2 h-[400px] md:h-full bg-red-900 overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&q=80&w=1000" 
          alt="Sale Season" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Sale</h2>
          <p className="max-w-md text-gray-200 text-sm mb-8">
            Incredible deals on your favourite pieces. Up to 50% off â€” limited time only, don't miss out.
          </p>
          <button 
            onClick={() => navigate('/category/sale')}
            className="bg-white text-black px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Banners;
