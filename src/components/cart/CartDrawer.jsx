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
        className={`fixed inset-y-0 right-0 z-[95] flex flex-col w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-bold text-base md:text-lg">Tu Carrito</h2>
            <span className="bg-black text-white text-[10px] md:text-xs px-2 py-0.5 rounded-full font-bold">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-900 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-gray-300">
              <ShoppingBag strokeWidth={1} className="mb-4 w-10 h-10 md:w-12 md:h-12" />
              <p className="text-sm font-medium">Tu carrito está vacío</p>
              <p className="text-xs mt-1 text-center">Agregá productos para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {items.map(({ product, quantity, cartKey, color, size }) => {
                let currentStock = Infinity;
                if (size && product.stock_by_size && typeof product.stock_by_size[size] === 'number') {
                  currentStock = product.stock_by_size[size];
                } else if (product.stock !== null && product.stock !== undefined && product.stock >= 0) {
                  currentStock = product.stock;
                }
                const hasStock = currentStock !== Infinity;
                const atMax = hasStock && quantity >= currentStock;
                return (
                  <div
                    key={cartKey}
                    className="flex gap-3 md:gap-4 p-3 rounded-xl bg-gray-50 group"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="font-semibold text-xs md:text-sm text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-[10px] md:text-xs text-gray-400 mb-1">
                        {product.category}
                        {color ? ` · ${color}` : ''}
                        {size ? ` · ${size}` : ''}
                      </p>
                      {hasStock && (
                        <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 hidden md:block">Stock: {currentStock}</p>
                      )}
                      <div className="flex items-center gap-1.5 md:gap-2 mt-auto">
                        <button
                          onClick={() => updateQuantity(cartKey, quantity - 1)}
                          className="w-6 h-6 md:w-7 md:h-7 rounded-md md:rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors shrink-0"
                        >
                          <Minus className="w-3 h-3 md:w-[12px] md:h-[12px]" />
                        </button>
                        <span className="text-xs md:text-sm font-bold w-5 md:w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartKey, quantity + 1)}
                          disabled={atMax}
                          className={`w-6 h-6 md:w-7 md:h-7 rounded-md md:rounded-lg bg-white border border-gray-200 flex items-center justify-center transition-colors shrink-0 ${
                            atMax ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-400'
                          }`}
                        >
                          <Plus className="w-3 h-3 md:w-[12px] md:h-[12px]" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between pl-1 md:pl-0">
                      <button
                        onClick={() => removeFromCart(cartKey)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 md:p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-[14px] md:h-[14px]" />
                      </button>
                      <span className="font-bold text-xs md:text-sm whitespace-nowrap">
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
          <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <span className="text-xs md:text-sm text-gray-500">Subtotal</span>
              <span className="font-bold text-base md:text-lg">USD {totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-3 md:py-4 rounded-full font-semibold text-sm md:text-base hover:bg-gray-800 transition-colors"
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
