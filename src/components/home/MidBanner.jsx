import React from 'react';
import { useNavigate } from 'react-router-dom';

const MidBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full relative h-[60vw] md:h-[100dvh] flex items-center justify-center overflow-hidden section-snap">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={import.meta.env.BASE_URL + "videopagina.mp4"} type="video/mp4" />
      </video>
      
      {/* Dark Overlay for better contrast on text */}
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 text-center text-white px-6 py-28 md:py-0 flex flex-col items-center">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-gray-300 mb-6">
          Colección 2025
        </p>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight tracking-tight">
          Estilo Sin Esfuerzo,<br />En Cada Paso
        </h2>
        <p className="text-gray-300 text-sm md:text-base max-w-lg mb-10 leading-relaxed">
          Descubre prendas que definen quién eres. Creadas con precisión, diseñadas para los audaces.
        </p>
        <button
          onClick={() => navigate('/category/nueva-coleccion')}
          className="bg-white text-black px-10 py-4 rounded-full font-bold text-sm hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
        >
          Ver Colección
        </button>
      </div>
    </section>
  );
};

export default MidBanner;
