import React, { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Martín G.',
    rating: 5,
    text: '"La calidad de la ropa es impresionante, se nota que usan buenos materiales. Pedí dos buzos y me llegaron en perfectas condiciones. Súper recomendable."'
  },
  {
    id: 2,
    name: 'Camila R.',
    rating: 4,
    text: '"Me encantó el diseño del hoodie que compré, es tal cual se ve en las fotos. El envío tardó un poquito más de lo esperado pero valió la pena la espera."'
  },
  {
    id: 3,
    name: 'Santiago L.',
    rating: 5,
    text: '"Excelente atención y productos de primera. Compré una campera y un jean, los dos me quedaron perfecto. Ya estoy mirando qué más pedir."'
  },
  {
    id: 4,
    name: 'Valentina M.',
    rating: 5,
    text: '"Soy re exigente con la ropa y quedé muy conforme. Las terminaciones son de calidad, los talles son fieles y el packaging es un detalle que se agradece."'
  },
  {
    id: 5,
    name: 'Facundo D.',
    rating: 4,
    text: '"Buenos productos en general, el buzo que pedí es muy cómodo y abrigado. Le doy 4 estrellas porque me hubiese gustado más variedad de colores."'
  },
  {
    id: 6,
    name: 'Lucía P.',
    rating: 5,
    text: '"Increíble la experiencia de compra. Todo llegó rápido, bien empaquetado y la calidad de las prendas superó mis expectativas. Ya recomendé la tienda a mis amigas."'
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Number of visible cards depends on screen size, but we always shift by 1
  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 768) return 3;
    }
    return 1;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = reviews.length - visibleCount;

  const next = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [maxIndex]);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="w-full min-h-[100dvh] flex flex-col justify-center py-16 md:py-24 section-snap relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">Our Happy Customers</h2>
          <div className="flex gap-2">
            <button 
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={next}
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel container */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out py-4"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="flex-shrink-0 px-3"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-200 fill-current'}`} 
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold">{review.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {review.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-black w-6' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
