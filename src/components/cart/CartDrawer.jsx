import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[95] h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} />
            <h2 className="font-bold text-lg">Tu Carrito</h2>
            <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-300">
              <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
              <p className="text-sm font-medium">Tu carrito está vacío</p>
              <p className="text-xs mt-1">Agregá productos para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity, cartKey, color, size }) => {
                const hasStock = product.stock !== null && product.stock !== undefined && product.stock > 0;
                const atMax = hasStock && quantity >= product.stock;
                return (
                  <div
                    key={cartKey}
                    className="flex gap-4 p-3 rounded-xl bg-gray-50 group"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-400 mb-1">
                        {product.category}
                        {color ? ` · ${color}` : ''}
                        {size ? ` · ${size}` : ''}
                      </p>
                      {hasStock && (
                        <p className="text-[10px] text-gray-400 mb-1">Stock: {product.stock}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(cartKey, quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartKey, quantity + 1)}
                          disabled={atMax}
                          className={`w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center transition-colors ${
                            atMax ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-400'
                          }`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(cartKey)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      <span className="font-bold text-sm">
                        USD {(Number(product.price) * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="font-bold text-lg">USD {totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              Ir al Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
