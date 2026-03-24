import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 1,
    subtitle: "A true classic, redefining street style",
    title: "Hoodie",
    description: "Our premium heavy-weight fleece hoodie is designed for the modern street aesthetic. Built with uncompromised craftsmanship for every day comfort.",
    image: "/hero-slide-1-new.png",
    link: "/category/mens"
  },
  {
    id: 2,
    subtitle: "Minimalist approach",
    title: "Essentials",
    description: "Stripped down to the absolute necessities without compromising on quality or style. The foundation of any modern wardrobe.",
    image: "/hero-slide-2-new.png",
    link: "/products"
  },
  {
    id: 3,
    subtitle: "Urban exploration gear",
    title: "Techwear",
    description: "Functional apparel built for the concrete jungle. Weather-resistant materials meet cutting-edge design for ultimate mobility.",
    image: "/hero-slide-3-new.png",
    link: "/category/mens"
  },
  {
    id: 4,
    subtitle: "Elevate your everyday look",
    title: "Multiply",
    description: "Experience the next level of comfort with our signature double-layered design. Perfect for any season and every occasion.",
    image: "/hero-slide-4.png",
    link: "/category/womens"
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-screen section-snap flex flex-col bg-white">
      {/* Spacer for the header (Option 2 implementation natively inside Hero) */}
      <div className="h-20 w-full shrink-0"></div>
      
      <section className="relative w-full flex-grow flex items-center overflow-hidden">
        
        {/* Left Content Container */}
        <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-8">
        
        {/* Variable Text Block */}
        <div className="relative h-[280px] w-full">
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`absolute top-0 left-0 w-full transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <p className="text-sm uppercase tracking-widest font-semibold text-gray-500 mb-4">
                {slide.subtitle}
              </p>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
                {slide.title}
              </h1>
              <p className="text-gray-600 max-w-md text-base md:text-lg leading-relaxed">
                {slide.description}
              </p>
            </div>
          ))}
        </div>

        {/* Shop Now Button */}
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => navigate(slides[currentSlide].link)}
            className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <ShoppingBagIcon className="w-4 h-4" /> Shop now
          </button>
        </div>
      </div>

      {/* Full Background Image Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full md:w-2/3 md:ml-auto right-0">
        {slides.map((slide, index) => (
          <img 
            key={slide.id}
            src={slide.image} 
            alt={slide.title} 
            className={`absolute top-0 right-0 w-full h-full object-cover md:object-contain object-right md:object-center transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          />
        ))}
      </div>

      {/* Navigation Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        
        {/* Pagination Numbers */}
        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-8 text-sm font-bold text-gray-300 pointer-events-auto">
          {slides.map((slide, index) => (
            <span 
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`cursor-pointer transition-colors duration-300 ${index === currentSlide ? 'text-black text-2xl scale-125 origin-center' : 'hover:text-gray-500'}`}
            >
              0{index + 1}
            </span>
          ))}
        </div>

      </div>

    </section>
    </div>
  );
};

// Quick inline icon component to avoid over-importing lucide if not needed
function ShoppingBagIcon(props) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
      <path d="M3 6h18"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

export default Hero;
