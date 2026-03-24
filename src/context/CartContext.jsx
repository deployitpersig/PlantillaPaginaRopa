import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

const getCartKey = (productId, color, size) => `${productId}_${color || ''}_${size || ''}`;

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (product, options = {}) => {
    const { color, size } = options;
    const stock = (product.stock !== null && product.stock !== undefined && product.stock > 0)
      ? product.stock
      : Infinity;

    const cartKey = getCartKey(product.id, color, size);

    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) {
        if (stock !== Infinity && existing.quantity >= stock) return prev;
        return prev.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, cartKey, color: color || null, size: size || null }];
    });
    return true;
  };

  const removeFromCart = (cartKey) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.cartKey === cartKey) {
          const stock = (i.product.stock !== null && i.product.stock !== undefined && i.product.stock > 0)
            ? i.product.stock
            : Infinity;
          const safeQty = stock !== Infinity ? Math.min(quantity, stock) : quantity;
          return { ...i, quantity: safeQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

