import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

// Helper: a product is "out of stock" only if stock is explicitly set to a number > 0 by admin
// and then depleted to 0 through purchases. If stock is null/undefined/0 from migration, it means
// stock is NOT being managed yet (treat as unlimited).
const isOutOfStock = (product) => {
  if (product.stock === null || product.stock === undefined) return false;
  if (product.stock > 0) return false;
  if (product.sold_count && product.sold_count > 0) return true;
  return false;
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let result = await supabase
          .from('products')
          .select('*')
          .order('sold_count', { ascending: false, nullsFirst: false })
          .limit(6);

        if (result.error) {
          result = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);
        }

        setProducts(result.data || []);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (isOutOfStock(product)) return;
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto text-center">
      {/* EST Badge */}
      <div className="inline-block border border-gray-900 rounded-full px-5 py-1.5 text-xs font-semibold tracking-wider mb-6">
        EST 2015
      </div>

      <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h2>
      <p className="text-gray-500 max-w-2xl mx-auto mb-12 text-sm leading-relaxed">
        Our focus is on producing high-quality, hard-wearing comfort and urban wear items for everyday life.
        Our products are the styles people need to live and thrive. Founded in 2015.
      </p>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-14 max-w-4xl mx-auto">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-14 text-left max-w-4xl mx-auto">
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

      {/* View More Button */}
      <button
        onClick={() => navigate('/products')}
        className="inline-flex items-center gap-2 border border-gray-900 text-gray-900 px-8 py-3 rounded-full font-semibold text-sm hover:bg-black hover:text-white transition-colors"
      >
        View more <ArrowRight size={16} strokeWidth={1.5} />
      </button>
    </section>
  );
};

export default Products;
