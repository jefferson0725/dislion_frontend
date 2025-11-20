import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useWishlist } from "../context/WishlistContext";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/utils/api";

interface ProductCardProps {
  id: number;
  image: string;
  name: string;
  description?: string;
  price: number;
  category: string;
}

const ProductCard = ({ id, image, name, description, price, category }: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(id);
  const [showPrices, setShowPrices] = useState(true);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Load show_prices setting on mount
  useEffect(() => {
    const loadShowPrices = async () => {
      try {
        const res = await apiFetch("/api/settings/show_prices");
        if (res.ok) {
          const data = await res.json();
          setShowPrices(data.value === "true" || data.value === true);
        }
      } catch (err) {
        console.error("Error loading show prices setting:", err);
      }
    };
    loadShowPrices();
  }, []);

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist({ id, image, name, price, category });
    }
  };

  return (
    <Card className="group overflow-hidden border-border bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-[var(--shadow-hover)]">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {category}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">{name}</h3>
        {description && (
          <div className="mt-2 space-y-2">
            <div 
              style={{
                maxHeight: expandedDescription ? `${descriptionRef.current?.scrollHeight || 500}px` : "48px",
                overflow: "hidden",
                transition: "max-height 0.5s ease-in-out",
              }}
            >
              <p 
                ref={descriptionRef}
                className="text-sm text-muted-foreground"
              >
                {description}
              </p>
            </div>
            {description.length > 100 && (
              <button
                onClick={() => setExpandedDescription(!expandedDescription)}
                className="text-xs font-semibold text-secondary hover:text-orange-600 transition-colors"
              >
                {expandedDescription ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          {showPrices ? (
            <span className="text-2xl font-bold text-accent">{formatPrice(price)}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Precio bajo consulta</span>
          )}
          <Button
            onClick={handleToggleWishlist}
            size="icon"
            className={`transition-all ${
              inWishlist
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;

