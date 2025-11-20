import { useState, useEffect } from "react";
import { X, Trash2, Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice } from "@/utils/formatPrice";
import { Button } from "@/components/ui/button";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistDrawer = ({ isOpen, onClose }: WishlistDrawerProps) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Duración de la animación
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-96 max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Productos de Interés
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Heart className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">
                No tienes productos seleccionados
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Agrega productos a tu lista de deseos para contactarnos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase mt-1">
                      {product.category}
                    </p>
                    <p className="text-lg font-bold text-accent mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="p-2 hover:bg-red-50 rounded-full transition-all hover:scale-110 active:scale-95 self-start"
                    aria-label="Eliminar de la lista"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {wishlist.length} producto{wishlist.length !== 1 ? "s" : ""} seleccionado{wishlist.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={clearWishlist}
                className="text-sm text-red-500 hover:text-red-600 font-medium transition-all hover:scale-105 active:scale-95"
              >
                Limpiar todo
              </button>
            </div>
            <Button
              onClick={handleClose}
              className="w-full bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              size="lg"
            >
              Cerrar
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistDrawer;
