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
    
    let baseStock = Infinity;
    if (size && product.stock_by_size && typeof product.stock_by_size[size] === 'number') {
      baseStock = product.stock_by_size[size];
    } else if (product.stock !== null && product.stock !== undefined && product.stock >= 0) {
      baseStock = product.stock;
    }

    const cartKey = getCartKey(product.id, color, size);
    const existing = items.find((i) => i.cartKey === cartKey);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + 1 > baseStock) {
      alert(`No hay más stock disponible. Máximo: ${baseStock} unidad(es).`);
      return false;
    }

    setItems((prev) => {
      const prevExisting = prev.find((i) => i.cartKey === cartKey);
      if (prevExisting) {
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

    const targetItem = items.find((i) => i.cartKey === cartKey);
    if (!targetItem) return;

    let baseStock = Infinity;
    if (targetItem.size && targetItem.product.stock_by_size && typeof targetItem.product.stock_by_size[targetItem.size] === 'number') {
      baseStock = targetItem.product.stock_by_size[targetItem.size];
    } else if (targetItem.product.stock !== null && targetItem.product.stock !== undefined && targetItem.product.stock >= 0) {
      baseStock = targetItem.product.stock;
    }

    if (quantity > baseStock) {
      alert(`No hay más stock disponible. Máximo: ${baseStock} unidad(es).`);
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i))
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

