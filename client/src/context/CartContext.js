import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const CartContext = createContext(null);

/**
 * Fournisseur de contexte pour le panier d'achats.
 * Stocke le panier de façon isolée par utilisateur (`cart_user_<userId>`).
 */
export function CartProvider({ children }) {
  const { token, user } = useContext(AuthContext);

  const getCartKey = (userId) => (userId ? `cart_user_${userId}` : null);

  // Initialisation du panier : chargé depuis localStorage uniquement si l'utilisateur est connecté
  const [items, setItems] = useState(() => {
    if (!user?.id) return [];
    const saved = localStorage.getItem(getCartKey(user.id));
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Recharger le panier lorsque l'utilisateur change (connexion / déconnexion)
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(getCartKey(user.id));
      try {
        setItems(saved ? JSON.parse(saved) : []);
      } catch (e) {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, [user?.id]);

  // Sauvegarder automatiquement les modifications du panier pour l'utilisateur connecté
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(getCartKey(user.id), JSON.stringify(items));
    }
  }, [items, user?.id]);

  /**
   * Ajoute un jeu au panier ou incrémente sa quantité s'il y est déjà.
   */
  const addItem = (game, quantity = 1) => {
    if (!user?.id) return;

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

  /**
   * Met à jour la quantité d'un article spécifique dans le panier.
   */
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

  /**
   * Supprime complètement un article du panier via son ID de jeu.
   */
  const removeItem = (gameId) => {
    setItems((prev) => prev.filter((item) => item.game_id !== gameId));
  };

  /**
   * Vide l'intégralité du panier de l'utilisateur actif.
   */
  const clearCart = () => {
    setItems([]);
    if (user?.id) {
      localStorage.removeItem(getCartKey(user.id));
    }
    localStorage.removeItem('cart_guest');
    localStorage.removeItem('cart');
  };

  /**
   * Déclenche le processus de paiement (checkout).
   */
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
      // Cart will be cleared only upon successful payment (on CheckoutSuccess page)
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
