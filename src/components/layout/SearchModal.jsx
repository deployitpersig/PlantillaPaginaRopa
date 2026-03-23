import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(8);
        setResults(data || []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAddToCart = (product) => {
    addToCart(product);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-w-2xl mx-auto mt-20 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-6 py-5 border-b border-gray-100">
          <Search size={20} className="text-gray-400 mr-4 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-1 text-lg outline-none placeholder:text-gray-300 bg-transparent"
          />
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results Dropdown */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              Buscando...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No se encontraron productos para "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400">{product.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm">USD {Number(product.price).toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      + Agregar
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="px-6 py-8 text-center text-gray-300 text-sm">
              Escribí el nombre de un producto para buscarlo
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
