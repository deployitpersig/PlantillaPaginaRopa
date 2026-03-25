import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Check, Loader2, Truck, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import ImageLightbox from '../components/product/ImageLightbox';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          console.warn('Product not found:', id);
          setLoading(false);
          return;
        }
        setProduct(data);
        // Pre-select first color and size if available
        const colors = data.colors || [];
        const sizes = data.sizes || [];
        if (colors.length > 0) setSelectedColor(colors[0]);
        if (sizes.length > 0) {
          if (data.stock_by_size && Object.keys(data.stock_by_size).length > 0) {
            const availableSize = sizes.find(sz => (data.stock_by_size[sz] || 0) > 0);
            setSelectedSize(availableSize || sizes[0]);
          } else {
            setSelectedSize(sizes[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const getImages = () => {
    if (!product) return [];
    const images = product.images || [];
    if (images.length > 0) return images;
    if (product.image) return [product.image];
    return [];
  };

  const handleAddToCart = () => {
    if (!product) return;
    const success = addToCart(product, { color: selectedColor, size: selectedSize });
    if (success) {
      setAdded(true);
      setIsOpen(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Producto no encontrado</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-black text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const images = getImages();
  const colors = product.colors || [];
  const sizes = product.sizes || [];
  const badges = product.badges || [];

  // Map common color names to hex values
  const COLOR_MAP = {
    'negro': '#000000', 'black': '#000000',
    'blanco': '#FFFFFF', 'white': '#FFFFFF',
    'rojo': '#EF4444', 'red': '#EF4444',
    'azul': '#3B82F6', 'blue': '#3B82F6',
    'verde': '#22C55E', 'green': '#22C55E',
    'amarillo': '#EAB308', 'yellow': '#EAB308',
    'naranja': '#F97316', 'orange': '#F97316',
    'rosa': '#EC4899', 'pink': '#EC4899',
    'violeta': '#8B5CF6', 'purple': '#8B5CF6',
    'gris': '#6B7280', 'gray': '#6B7280', 'grey': '#6B7280',
    'marrón': '#92400E', 'brown': '#92400E',
    'beige': '#D4B896',
    'celeste': '#7DD3FC', 'lightblue': '#7DD3FC',
    'bordo': '#7F1D1D', 'burgundy': '#7F1D1D',
    'crema': '#FFFDD0', 'cream': '#FFFDD0',
    'coral': '#FB7185',
    'oliva': '#65A30D', 'olive': '#65A30D',
    'navy': '#1E3A5F', 'marino': '#1E3A5F',
  };

  const getColorHex = (colorName) => {
    return COLOR_MAP[colorName.toLowerCase()] || '#9CA3AF';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        {/* LEFT: Image Gallery */}
        <div className="w-full lg:w-[55%]">
          {images.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightbox(idx)}
                  className={`${images.length === 1 ? 'w-full max-w-lg' : 'w-[calc(50%-0.375rem)]'} aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden cursor-pointer group flex items-center justify-center`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - ${idx + 1}`}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-[3/4] bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
              <span className="text-sm">Sin imágenes</span>
            </div>
          )}
        </div>

        {/* RIGHT: Product Info */}
        <div className="w-full lg:w-[45%] lg:sticky lg:top-28 lg:self-start">
          {/* Favorite button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Code */}
              {product.code && (
                <p className="text-xs text-gray-400 tracking-wider mb-2 font-medium">{product.code}</p>
              )}
              {/* Name */}
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>
          </div>

          {/* Price */}
          <div className="mb-5">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold">
                $ {Number(product.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
              {product.original_price && (
                <span className="text-base text-gray-400 line-through">
                  $ {Number(product.original_price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              )}
              {product.discount && (
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            {product.price_without_tax != null && (
              <p className="text-sm text-gray-400 mt-1">
                $ {Number(product.price_without_tax).toLocaleString('es-AR', { minimumFractionDigits: 2 })} sin impuestos
              </p>
            )}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="bg-gray-900 text-white text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-md"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mb-6 border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line font-light">
                {product.description}
              </p>
            </div>
          )}

          {/* Color Selector */}
          {colors.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Color</span>
                {selectedColor && (
                  <span className="text-xs text-gray-400 font-medium">— {selectedColor}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === color
                        ? 'border-black scale-110 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    title={color}
                  >
                    <span
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Talle</span>
                {product.stock_by_size && selectedSize && (
                  <span className="text-xs text-gray-400 font-medium">
                    {product.stock_by_size[selectedSize] || 0} disponibles
                  </span>
                )}
                <button className="text-xs text-gray-500 underline hover:text-black transition-colors">
                  GUÍA DE TALLES
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const szStock = product.stock_by_size ? (product.stock_by_size[size] || 0) : null;
                  const isSzOut = szStock !== null && szStock <= 0;
                  return (
                    <button
                      key={size}
                      onClick={() => { if (!isSzOut) setSelectedSize(size); }}
                      disabled={isSzOut}
                      className={`min-w-[44px] h-[44px] px-3 border text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : isSzOut
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                            : 'bg-white text-gray-900 border-gray-200 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          {(() => {
            const outOfStockFlag = sizes.length > 0 && product.stock_by_size && selectedSize
              ? (product.stock_by_size[selectedSize] || 0) <= 0
              : (product.stock !== null && product.stock !== undefined && product.stock <= 0 && (!product.stock_by_size || Object.keys(product.stock_by_size).length === 0));
              
            return (
              <button
                onClick={handleAddToCart}
                disabled={added || outOfStockFlag}
                className={`w-full py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-green-600 text-white'
                    : outOfStockFlag
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} /> AGREGADO
                  </>
                ) : outOfStockFlag ? (
                  'SIN STOCK'
                ) : (
                  'AGREGAR'
                )}
              </button>
            );
          })()}

          {/* Collapsible Sections */}
          <div className="mt-8 border-t border-gray-100">
            {/* Shipping */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection('shipping')}
                className="w-full flex items-center justify-between py-4 text-sm font-medium text-gray-900 hover:text-black transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Truck size={16} className="text-gray-400" />
                  <span>Métodos de envío</span>
                </div>
                <span className={`text-lg text-gray-400 transition-transform duration-300 ${expandedSections.shipping ? 'rotate-45' : ''}`}>+</span>
              </button>
              {expandedSections.shipping && (
                <div className="pb-4 text-sm text-gray-500 leading-relaxed pl-9" style={{ animation: 'slideDown 0.2s ease-out' }}>
                  <p className="mb-2">• Envío a todo el país por correo</p>
                  <p className="mb-2">• Envío a CABA y GBA en 24-48hs</p>
                  <p className="mb-2">• Retiro gratis en sucursal</p>
                  <p>• Envío gratis en compras mayores a $50.000</p>
                </div>
              )}
            </div>

            {/* Returns */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection('returns')}
                className="w-full flex items-center justify-between py-4 text-sm font-medium text-gray-900 hover:text-black transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw size={16} className="text-gray-400" />
                  <span>Cambios y Devoluciones</span>
                </div>
                <span className={`text-lg text-gray-400 transition-transform duration-300 ${expandedSections.returns ? 'rotate-45' : ''}`}>+</span>
              </button>
              {expandedSections.returns && (
                <div className="pb-4 text-sm text-gray-500 leading-relaxed pl-9" style={{ animation: 'slideDown 0.2s ease-out' }}>
                  <p className="mb-2">• 30 días para cambios y devoluciones</p>
                  <p className="mb-2">• El producto debe estar sin uso y con etiquetas</p>
                  <p>• Contactanos por email o WhatsApp para gestionar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;
