import React, { createContext, useState, useEffect } from "react";

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
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (uniqueKey: string) => void;
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

  const addToWishlist = (product: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.uniqueKey === product.uniqueKey);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (uniqueKey: string) => {
    setWishlist((prev) => prev.filter((p) => p.uniqueKey !== uniqueKey));
  };

  const isInWishlist = (uniqueKey: string) => {
    return wishlist.some((p) => p.uniqueKey === uniqueKey);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
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
