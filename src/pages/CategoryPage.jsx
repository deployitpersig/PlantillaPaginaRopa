import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

const SUBCATEGORIES = {
  mens: ['T-Shirts', 'Polo Shirts', 'Hoodies', 'Jackets', 'Jeans', 'Pants', 'Shorts', 'Suits', 'Swimwear', 'Socks', 'Accessories'],
  womens: ['T-Shirts', 'Tops', 'Blouses', 'Hoodies', 'Jackets', 'Dresses', 'Skirts', 'Jeans', 'Pants', 'Shorts', 'Underwear', 'Swimwear', 'Jumpsuits', 'Socks & Tights', 'Accessories'],
  kids: ['T-Shirts', 'Shirts', 'Hoodies', 'Jackets', 'Jeans', 'Pants & Leggings', 'Shorts', 'Dresses', 'Skirts', 'Underwear', 'Swimwear', 'Socks', 'Accessories'],
};

const CATEGORY_CONFIG = {
  'new-arrivals': {
    title: 'New Arrivals',
    description: 'Discover our latest drops and newest additions to the collection.',
    filter: (query) => query.order('created_at', { ascending: false }),
  },
  'new-collection': {
    title: 'New Collection',
    description: 'Discover our latest drops and newest additions to the collection.',
    filter: (query) => query.eq('new_collection', true).order('created_at', { ascending: false }),
  },
  mens: {
    title: 'Mens',
    description: 'Explore our complete mens collection — from streetwear to essentials.',
    filter: (query) => query.eq('category', 'mens'),
  },
  womens: {
    title: 'Womens',
    description: 'Shop the latest womens styles — curated for comfort and confidence.',
    filter: (query) => query.eq('category', 'womens'),
  },
  kids: {
    title: 'Kids',
    description: 'Fun, durable and stylish pieces for the little ones.',
    filter: (query) => query.eq('category', 'kids'),
  },
  sale: {
    title: 'Sale',
    description: 'Limited time offers — grab your favourites before they\'re gone.',
    filter: (query) => query.not('discount', 'is', null),
  },
};

// Helper: only out of stock if stock was depleted through actual sales
const isOutOfStock = (product) => {
  if (product.stock_by_size && Object.keys(product.stock_by_size).length > 0) {
    const totalSizesStock = Object.values(product.stock_by_size).reduce((sum, curr) => sum + (parseInt(curr, 10) || 0), 0);
    if (totalSizesStock > 0) return false;
    if (product.sold_count && product.sold_count > 0) return true;
    return false;
  }
  if (product.stock === null || product.stock === undefined) return false;
  if (product.stock > 0) return false;
  if (product.sold_count && product.sold_count > 0) return true;
  return false;
};

const CategoryPage = ({ showAll = false }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const { addToCart } = useCart();

  const config = showAll
    ? { title: 'All Products', description: 'Browse our complete catalog.' }
    : CATEGORY_CONFIG[slug];

  const subcategories = SUBCATEGORIES[slug] || [];

  useEffect(() => {
    if (location.state?.subcategory) {
      setActiveFilters([location.state.subcategory]);
    } else {
      setActiveFilters([]);
    }
  }, [slug, location.key]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');

        if (!showAll && config?.filter) {
          query = config.filter(query);
        }

        if (!slug || slug !== 'new-arrivals') {
          query = query.order('created_at', { ascending: false });
        }

        const { data } = await query;
        const fetched = data || [];
        setAllProducts(fetched);
        setProducts(fetched);
      } catch {
        setAllProducts([]);
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [slug, showAll]);

  // Client-side filtering when subcategory pills are toggled
  useEffect(() => {
    if (activeFilters.length === 0) {
      setProducts(allProducts);
    } else {
      const filtered = allProducts.filter((p) => {
        const sub = (p.subcategory || '').toLowerCase();
        return activeFilters.some((f) => sub.includes(f.toLowerCase()));
      });
      setProducts(filtered);
    }
  }, [activeFilters, allProducts]);

  const toggleFilter = (sub) => {
    setActiveFilters((prev) =>
      prev.includes(sub) ? prev.filter((f) => f !== sub) : [...prev, sub]
    );
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (isOutOfStock(product)) return;
    if (product.sizes && product.sizes.length > 0 && product.stock_by_size) {
      // If product has sizes and stock per size, redirect to details page to choose size
      navigate(`/product/${product.id}`);
      return;
    }
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  if (!config && !showAll) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" strokeWidth={1} />
        <h2 className="text-xl font-bold mb-2">Category not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 bg-black text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block border border-gray-900 rounded-full px-5 py-1.5 text-xs font-semibold tracking-wider mb-6">
          {showAll ? 'CATALOG' : slug?.toUpperCase().replace('-', ' ')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{config.title}</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Subcategory Filter Pills */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {subcategories.map((sub) => {
            const isActive = activeFilters.includes(sub);
            return (
              <button
                key={sub}
                onClick={() => toggleFilter(sub)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 border ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900 shadow-md shadow-gray-900/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                {sub}
              </button>
            );
          })}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="px-5 py-2 rounded-full text-xs font-semibold tracking-wide text-red-500 border border-red-200 hover:bg-red-50 transition-all"
            >
              Limpiar filtros ✕
            </button>
          )}
        </div>
      )}

      {/* Active filter count */}
      {activeFilters.length > 0 && (
        <p className="text-center text-xs text-gray-400 mb-6">
          {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 max-w-4xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingCart size={48} className="mx-auto mb-4" strokeWidth={1} />
          <p className="font-medium">
            {activeFilters.length > 0 ? 'No hay productos con esos filtros' : 'No products found in this category'}
          </p>
          <p className="text-sm mt-1">
            {activeFilters.length > 0 ? 'Probá quitando algunos filtros' : 'Check back later for new arrivals!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 text-left max-w-4xl mx-auto">
          {products.map((product) => {
            const outOfStock = isOutOfStock(product);
            return (
              <div key={product.id} className="group cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-50 mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
                  />
                  {/* Out of Stock Overlay */}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-900 text-sm uppercase tracking-wider font-bold px-5 py-2 rounded-full">
                        Agotado
                      </span>
                    </div>
                  )}
                  {product.tag && !outOfStock && (
                    <span className="absolute bottom-4 left-4 bg-gray-900 text-white text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-md">
                      {product.tag}
                    </span>
                  )}
                  {/* Subcategory badge */}
                  {product.subcategory && (
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-600 text-[10px] font-medium px-2.5 py-1 rounded-full">
                      {product.subcategory}
                    </span>
                  )}
                  {/* Add to Cart Button */}
                  {!outOfStock && (
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        addedId === product.id
                          ? 'bg-green-500 text-white scale-110'
                          : 'bg-white text-gray-900 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:bg-black hover:text-white'
                      }`}
                    >
                      {addedId === product.id ? <Check size={16} /> : <ShoppingCart size={16} />}
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-0.5 text-sm leading-snug">{product.name}</h3>
                  <p className="text-gray-400 text-xs mb-1">{product.category}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">USD {Number(product.price).toFixed(2)}</span>
                    {product.original_price && (
                      <span className="text-gray-400 line-through text-xs">USD {Number(product.original_price).toFixed(2)}</span>
                    )}
                    {product.discount && (
                      <span className="text-red-500 text-[10px] font-bold bg-red-50 px-2 py-0.5 rounded">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                  {outOfStock && (
                    <p className="text-red-500 text-xs font-semibold mt-1">Sin stock</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
