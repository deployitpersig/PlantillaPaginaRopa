import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageLightbox = ({ images, currentIndex, onClose, onNavigate }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNavigate(Math.max(0, currentIndex - 1));
    if (e.key === 'ArrowRight') onNavigate(Math.min(images.length - 1, currentIndex + 1));
  }, [currentIndex, images.length, onClose, onNavigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={onClose}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
      >
        <X size={28} />
      </button>

      {/* Counter */}
      <div className="absolute top-6 left-6 text-white/50 text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
          className="absolute left-4 md:left-8 text-white/50 hover:text-white transition-colors p-2"
        >
          <ChevronLeft size={36} />
        </button>
      )}

      {/* Image */}
      <div className="max-w-5xl max-h-[90vh] px-16" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex]}
          alt={`Imagen ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain mx-auto"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        />
      </div>

      {/* Next */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
          className="absolute right-4 md:right-8 text-white/50 hover:text-white transition-colors p-2"
        >
          <ChevronRight size={36} />
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ImageLightbox;
