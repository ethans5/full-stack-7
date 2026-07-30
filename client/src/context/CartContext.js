import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [items, setItems] = useState(() => {
    // Load cart from localStorage on mount
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Clear cart on logout
  useEffect(() => {
    if (!isAuthenticated) {
      // Keep cart in localStorage but it will be validated on checkout
    }
  }, [isAuthenticated]);

  const addItem = (game, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.game_id === game.id);
      if (existing) {
        return prev.map((item) =>
          item.game_id === game.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          game_id: game.id,
          title: game.title,
          price: game.price,
          image_url: game.image_url,
          quantity,
          stock_quantity: game.stock_quantity,
        },
      ];
    });
  };

  const updateQuantity = (gameId, quantity) => {
    if (quantity <= 0) {
      removeItem(gameId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.game_id === gameId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (gameId) => {
    setItems((prev) => prev.filter((item) => item.game_id !== gameId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const checkout = async () => {
    const cartItems = items.map((item) => ({
      game_id: item.game_id,
      quantity: item.quantity,
    }));

    const response = await fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: cartItems }),
    });

    const data = await response.json();

    if (response.ok) {
      clearCart();
      return { success: true, checkout_url: data.data.checkout_url };
    }

    return { success: false, message: data.message };
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    totalPrice,
    totalItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    checkout,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
