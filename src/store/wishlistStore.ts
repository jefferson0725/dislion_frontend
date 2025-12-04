import { create } from 'zustand';

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

interface WishlistState {
  wishlist: WishlistItem[];
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (uniqueKey: string) => void;
  isInWishlist: (uniqueKey: string) => boolean;
  clearWishlist: () => void;
  loadFromStorage: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],

  // Cargar desde localStorage
  loadFromStorage: () => {
    try {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        set({ wishlist: JSON.parse(saved) });
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
    }
  },

  // Agregar producto
  addToWishlist: (product: WishlistItem) => {
    set((state) => {
      const exists = state.wishlist.find((p) => p.uniqueKey === product.uniqueKey);
      if (exists) return state;
      
      const newWishlist = [...state.wishlist, product];
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return { wishlist: newWishlist };
    });
  },

  // Remover producto
  removeFromWishlist: (uniqueKey: string) => {
    set((state) => {
      const newWishlist = state.wishlist.filter((p) => p.uniqueKey !== uniqueKey);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return { wishlist: newWishlist };
    });
  },

  // Verificar si está en wishlist
  isInWishlist: (uniqueKey: string) => {
    return get().wishlist.some((p) => p.uniqueKey === uniqueKey);
  },

  // Limpiar wishlist
  clearWishlist: () => {
    localStorage.setItem('wishlist', JSON.stringify([]));
    set({ wishlist: [] });
  },
}));
