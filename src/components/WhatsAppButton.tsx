import { MessageCircle, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useWishlist } from "../context/WishlistContext";
import WishlistDrawer from "./WishlistDrawer";

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const { wishlist } = useWishlist();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Load WhatsApp number from data.json
    const loadWhatsApp = async () => {
      try {
        const res = await axios.get('/api/export');
        const data = res.data;
        const number = data.settings?.whatsapp_number || '573007571199'; // Número por defecto
        setWhatsappNumber(number);
      } catch (err) {
        console.error('Error loading WhatsApp number:', err);
        // Set default number if loading fails
        setWhatsappNumber('573007571199');
      }
    };
    loadWhatsApp();
  }, []);

  if (!whatsappNumber) return null;

  const handleClick = () => {
    // Format: remove spaces, dashes, parentheses
    const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
    
    let message = 'Hola, me interesan estos productos:';
    
    if (wishlist.length > 0) {
      const productNames = wishlist.map(product => product.name).join(', ');
      message += `\n${productNames}`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <>
      <WishlistDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      <div className="relative">
        <button
          onClick={handleClick}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition-all hover:scale-110 hover:shadow-xl active:scale-95"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
        
        {/* Wishlist indicator badge - clickable */}
        {wishlist.length > 0 && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-white rounded-lg shadow-md p-3 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            <span className="text-sm font-semibold text-foreground">
              {wishlist.length} producto{wishlist.length !== 1 ? 's' : ''} seleccionado{wishlist.length !== 1 ? 's' : ''}
            </span>
          </button>
        )}
      </div>
    </>
  );
};

export default WhatsAppButton;
