import React from 'react';
import { useNavigate } from 'react-router-dom';

const Banners = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full flex flex-col md:flex-row min-h-[100dvh] md:h-[100dvh] section-snap">
      {/* Left Banner - New Arrivals */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-center bg-gray-900 overflow-hidden group py-24 md:py-0 md:h-full">
        <img 
          src="https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&q=80&w=1000" 
          alt="New Arrivals in streetwear"
          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center p-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Nuevos Ingresos</h2>
          <p className="max-w-md text-gray-200 text-sm mb-8">
            Vibras urbanas, estilo atemporal. Calidad sin concesiones para la estética moderna.
          </p>
          <button 
            onClick={() => navigate('/category/nuevos-ingresos')}
            className="bg-white text-black px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Comprar Ahora
          </button>
        </div>
      </div>

      {/* Right Banner - Sale */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-center bg-red-900 overflow-hidden group py-24 md:py-0 md:h-full">
        <img 
          src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&q=80&w=1000" 
          alt="Sale Season" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-white text-center p-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ofertas</h2>
          <p className="max-w-md text-gray-200 text-sm mb-8">
            Ofertas increíbles en tus prendas favoritas. Hasta 50% de descuento — por tiempo limitado, no te lo pierdas.
          </p>
          <button 
            onClick={() => navigate('/category/ofertas')}
            className="bg-white text-black px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Comprar Ahora
          </button>
        </div>
      </div>
    </section>
  );
};

export default Banners;
