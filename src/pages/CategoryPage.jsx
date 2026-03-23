import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

const CATEGORY_CONFIG = {
  'new-arrivals': {
    title: 'New Arrivals',
    description: 'Discover our latest drops and newest additions to the collection.',
    filter: (query) => query.order('created_at', { ascending: false }),
  },
  mens: {
    title: 'Mens',
    description: 'Explore our complete mens collection — from streetwear to essentials.',
    filter: (query) => query.ilike('category', '%men%'),
  },
  womens: {
    title: 'Womens',
    description: 'Shop the latest womens styles — curated for comfort and confidence.',
    filter: (query) => query.ilike('category', '%women%'),
  },
  kids: {
    title: 'Kids',
    description: 'Fun, durable and stylish pieces for the little ones.',
    filter: (query) => query.ilike('category', '%kid%'),
  },
  sale: {
    title: 'Sale',
    description: 'Limited time offers — grab your favourites before they\'re gone.',
    filter: (query) => query.not('discount', 'is', null),
  },
};

// Helper: only out of stock if stock was depleted through actual sales
const isOutOfStock = (product) => {
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
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  const searchParams = new URLSearchParams(location.search);
  const searchFilter = searchParams.get('search');

  const config = showAll
    ? { title: 'All Products', description: 'Browse our complete catalog.' }
    : CATEGORY_CONFIG[slug];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');

        if (!showAll && config?.filter) {
          query = config.filter(query);
        }

        if (searchFilter) {
          query = query.or(`name.ilike.%${searchFilter}%,category.ilike.%${searchFilter}%`);
        }

        if (!slug || slug !== 'new-arrivals') {
          query = query.order('created_at', { ascending: false });
        }

        const { data } = await query;
        setProducts(data || []);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [slug, showAll]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (isOutOfStock(product)) return;
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
      <div className="text-center mb-14">
        <div className="inline-block border border-gray-900 rounded-full px-5 py-1.5 text-xs font-semibold tracking-wider mb-6">
          {showAll ? 'CATALOG' : slug?.toUpperCase().replace('-', ' ')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{config.title}</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
          {config.description}
        </p>
      </div>

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
          <p className="font-medium">No products found in this category</p>
          <p className="text-sm mt-1">Check back later for new arrivals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 text-left max-w-4xl mx-auto">
          {products.map((product) => {
            const outOfStock = isOutOfStock(product);
            return (
              <div key={product.id} className="group cursor-pointer">
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
                        {product.discount}
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
