import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";

interface WishlistItem {
  id: number;
  image: string;
  name: string;
  price: number;
  category: string;
  selectedSize?: {
    id: number;
    size: string;
    price: number;
    image: string | null;
  } | null;
  uniqueKey: string; // productId o productId-sizeId
  quantity: number; // cantidad deseada
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (product: Omit<WishlistItem, 'quantity'>) => void;
  removeFromWishlist: (uniqueKey: string) => void;
  updateQuantity: (uniqueKey: string, quantity: number) => void;
  isInWishlist: (uniqueKey: string) => boolean;
  clearWishlist: () => void;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.error('Error saving wishlist:', err);
    }
  }, [wishlist]);

  const addToWishlist = useCallback((product: Omit<WishlistItem, 'quantity'>) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.uniqueKey === product.uniqueKey);
      if (exists) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromWishlist = useCallback((uniqueKey: string) => {
    setWishlist((prev) => prev.filter((p) => p.uniqueKey !== uniqueKey));
  }, []);

  const updateQuantity = useCallback((uniqueKey: string, quantity: number) => {
    setWishlist((prev) =>
      prev.map((p) =>
        p.uniqueKey === uniqueKey ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  }, []);

  const isInWishlist = useCallback((uniqueKey: string) => {
    return wishlist.some((p) => p.uniqueKey === uniqueKey);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const value = useMemo(
    () => ({ wishlist, addToWishlist, removeFromWishlist, updateQuantity, isInWishlist, clearWishlist }),
    [wishlist, addToWishlist, removeFromWishlist, updateQuantity, isInWishlist, clearWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = React.useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
