import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, X, MessageCircle } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/deployit.ok';
const INSTAGRAM_HANDLE = '@deployit.ok';
// ⚠️ PLACEHOLDER — reemplazar con el número real de WhatsApp
const WHATSAPP_NUMBER = '5491100000000';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// ⚠️ PLACEHOLDER — reemplazar con las coordenadas reales
const MAP_LAT = -32.9468;
const MAP_LNG = -60.6393;
const MAP_ADDRESS = 'Rosario, Santa Fe, Argentina';

// Google Maps embed URL — grayscale via CSS, no UI controls
const MAP_EMBED_URL = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3348.5!2d${MAP_LNG}!3d${MAP_LAT}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDU2JzQ4LjUiUyA2MMKwMzgnMjEuNSJX!5e0!3m2!1ses-419!2sar!4v1`;

// Typewriter text content
const TITLE_TEXT = 'QUIENES SOMOS';
const PARAGRAPH_TEXT = 'Somos una marca que nace de la pasión por el streetwear y la cultura urbana. Cada prenda está pensada para quienes buscan calidad, identidad y estilo sin esfuerzo. Nos encontrás en el corazón de la ciudad — pasá a conocernos o escribinos.';

const Features = () => {
  const [mapOpen, setMapOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const sectionRef = useRef(null);

  // Typewriter state
  const [titleText, setTitleText] = useState('');
  const [paraText, setParaText] = useState('');
  const [showTitleCursor, setShowTitleCursor] = useState(false);
  const [showParaCursor, setShowParaCursor] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [titleDone, setTitleDone] = useState(false);
  const [paraDone, setParaDone] = useState(false);

  // Dispatch custom event when section enters/leaves viewport so Header can react
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        window.dispatchEvent(new CustomEvent('quienes-somos-visibility', { detail: { visible: entry.isIntersecting } }));
        // Trigger typewriter only once
        if (entry.isIntersecting && !animationStarted) {
          setAnimationStarted(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [animationStarted]);

  // Typewriter: title first, then paragraph
  useEffect(() => {
    if (!animationStarted) return;

    let cancelled = false;
    let titleIndex = 0;
    let paraIndex = 0;

    setShowTitleCursor(true);

    // Type the title at 100ms per letter
    const typeTitle = () => {
      if (cancelled) return;
      if (titleIndex <= TITLE_TEXT.length) {
        setTitleText(TITLE_TEXT.slice(0, titleIndex));
        titleIndex++;
        setTimeout(typeTitle, 100);
      } else {
        // Title done
        setShowTitleCursor(false);
        setTitleDone(true);
        // Small pause before starting paragraph
        setTimeout(() => {
          if (cancelled) return;
          setShowParaCursor(true);
          typePara();
        }, 300);
      }
    };

    // Type the paragraph at 35ms per letter
    const typePara = () => {
      if (cancelled) return;
      if (paraIndex <= PARAGRAPH_TEXT.length) {
        setParaText(PARAGRAPH_TEXT.slice(0, paraIndex));
        paraIndex++;
        setTimeout(typePara, 35);
      } else {
        // Paragraph done
        setShowParaCursor(false);
        setParaDone(true);
      }
    };

    typeTitle();

    return () => { cancelled = true; };
  }, [animationStarted]);

  return (
    <section
      ref={sectionRef}
      id="quienes-somos"
      className="w-full bg-[#0a0a0a] min-h-screen flex items-center py-14 md:py-20 px-6 md:px-12 section-snap"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto text-center w-full">

        {/* Title — Cormorant Garamond 300, typewriter */}
        <h2
          className="text-3xl md:text-5xl text-[#f0f0f0] tracking-[0.25em] mb-5 uppercase"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, minHeight: '1.2em' }}
        >
          {titleText}
          {showTitleCursor && <span className="qs-cursor">|</span>}
        </h2>

        {/* Description — Inter 200, typewriter */}
        <p
          className="text-[#888] text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-10 md:mb-14 tracking-wide"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 200, minHeight: '4.5em' }}
        >
          {paraText}
          {showParaCursor && <span className="qs-cursor">|</span>}
        </p>

        {/* Grid: Map + Social */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">

          {/* Map Block — col-span-3 */}
          <div className="md:col-span-3 relative rounded-2xl border border-white/10 overflow-hidden bg-[#111] transition-all duration-500" style={{ minHeight: '260px' }}>
            {!mapOpen ? (
              /* Placeholder */
              <button
                onClick={() => setMapOpen(true)}
                className="w-full h-full flex flex-col items-center justify-center gap-3 group cursor-pointer transition-all duration-500"
                style={{ minHeight: '260px' }}
              >
                <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-500">
                  <MapPin className="w-5 h-5 text-[#888] group-hover:text-[#f0f0f0] transition-colors duration-500" />
                </div>
                <span className="text-[#888] text-xs tracking-widest uppercase group-hover:text-[#f0f0f0] transition-colors duration-500 font-extralight" style={{ fontWeight: 200 }}>
                  Ver ubicación
                </span>
              </button>
            ) : (
              /* Map expanded */
              <div className="relative w-full h-full" style={{ minHeight: '260px', animation: 'quienesMapIn 600ms ease-out forwards' }}>
                {/* Loading pin — disappears when iframe loads */}
                {!mapLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3" style={{ animation: 'quienesPinDrop 600ms ease-out forwards' }}>
                    <MapPin className="w-8 h-8 text-[#f0f0f0]" />
                    <span className="text-[#888] text-xs tracking-widest uppercase font-extralight" style={{ fontWeight: 200 }}>Cargando mapa…</span>
                  </div>
                )}
                {/* Google Maps iframe — lazy loaded only when mapOpen is true */}
                <iframe
                  title="Ubicación"
                  src={MAP_EMBED_URL}
                  className="w-full h-full border-0 grayscale contrast-[1.1] brightness-[0.4]"
                  style={{ minHeight: '260px' }}
                  loading="lazy"
                  allowFullScreen={false}
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setMapLoaded(true)}
                />
                {/* Close button */}
                <button
                  onClick={() => { setMapOpen(false); setMapLoaded(false); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[#888] hover:text-white hover:border-white/30 transition-all duration-300 z-20"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Address footer */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 z-10"
                  style={{ animation: 'quienesSlideUp 500ms 300ms ease-out both' }}
                >
                  <p className="text-[#f0f0f0] text-xs tracking-wider font-extralight" style={{ fontWeight: 200 }}>
                    📍 {MAP_ADDRESS}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right column — Instagram + WhatsApp stacked */}
          <div className="md:col-span-2 flex flex-col gap-3 md:gap-4">

            {/* Instagram Block */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-2xl border border-white/10 bg-[#111] flex flex-col items-center justify-center gap-2.5 py-8 md:py-0 group cursor-pointer hover:bg-white/[0.03] hover:border-white/20 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/25 transition-all duration-500 relative z-10">
                <svg className="w-5 h-5 text-[#888] group-hover:text-[#f0f0f0] transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="text-[#888] text-xs tracking-wider group-hover:text-[#f0f0f0] transition-colors duration-500 relative z-10 font-extralight" style={{ fontWeight: 200 }}>
                {INSTAGRAM_HANDLE}
              </span>
              <div className="w-6 h-px bg-white/0 group-hover:bg-white/20 group-hover:w-12 transition-all duration-500 relative z-10" />
            </a>

            {/* WhatsApp Block */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-2xl border border-white/10 bg-[#111] flex flex-col items-center justify-center gap-2.5 py-8 md:py-0 group cursor-pointer hover:bg-white/[0.03] hover:border-white/20 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/25 transition-all duration-500 relative z-10">
                <MessageCircle className="w-5 h-5 text-[#888] group-hover:text-[#f0f0f0] transition-colors duration-500" />
              </div>
              <span className="text-[#888] text-xs tracking-wider group-hover:text-[#f0f0f0] transition-colors duration-500 relative z-10 font-extralight" style={{ fontWeight: 200 }}>
                Escribinos
              </span>
              <div className="w-6 h-px bg-white/0 group-hover:bg-white/20 group-hover:w-12 transition-all duration-500 relative z-10" />
            </a>
          </div>
        </div>
      </div>

      {/* Keyframes + cursor blink */}
      <style>{`
        @keyframes quienesMapIn {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes quienesPinDrop {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes quienesSlideUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes qsCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .qs-cursor {
          display: inline;
          font-weight: 100;
          color: #f0f0f0;
          animation: qsCursorBlink 700ms steps(1) infinite;
          margin-left: 2px;
        }
      `}</style>
    </section>
  );
};

export default Features;
