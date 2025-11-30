import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useWishlist } from "../context/WishlistContext";
import { useState, useEffect } from "react";
import { apiFetch } from "@/utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductSize {
  id: number;
  size: string;
  price: number;
  image: string | null;
}

interface ProductCardProps {
  id: number;
  image: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  sizes?: ProductSize[];
}

const ProductCard = ({ id, image, name, description, price, category, sizes = [] }: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [showPrices, setShowPrices] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

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

  // Set default selected size when sizes change
  useEffect(() => {
    if (sizes && sizes.length > 0 && !selectedSizeId) {
      setSelectedSizeId(String(sizes[0].id));
      setSelectedSize(sizes[0]);
    }
  }, [sizes, selectedSizeId]);

  // Update selected size when size changes
  const handleSizeChange = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    const size = sizes.find(s => String(s.id) === sizeId);
    setSelectedSize(size || null);
  };

  // Generate unique key for wishlist (includes size if selected)
  const getWishlistKey = () => {
    if (selectedSize) {
      return `${id}-${selectedSize.id}`;
    }
    return String(id);
  };

  const inWishlist = isInWishlist(getWishlistKey());

  const handleToggleWishlist = () => {
    const uniqueKey = getWishlistKey();
    if (inWishlist) {
      removeFromWishlist(uniqueKey);
    } else {
      addToWishlist({ 
        id, 
        image: displayImage, 
        name, 
        price: displayPrice, 
        category,
        selectedSize: selectedSize || null,
        uniqueKey
      });
    }
  };

  // Determine the display price and image
  const displayPrice = selectedSize ? selectedSize.price : price;
  const displayImage = selectedSize && selectedSize.image ? selectedSize.image : image;

  return (
    <>
      <Card className="group overflow-hidden border border-gray-200 bg-white shadow-md hover:shadow-xl hover:shadow-[#0A1045]/15 transition-all duration-300 flex flex-col h-full hover:scale-[1.02]">
        <div 
          className="aspect-square overflow-hidden bg-gray-50 cursor-pointer relative"
          onClick={() => description && setIsDialogOpen(true)}
        >
          {/* Botón de Wishlist - arriba a la izquierda */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleWishlist();
            }}
            className={`absolute top-3 left-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all ${
              inWishlist
                ? 'bg-red-500/90 hover:bg-red-600'
                : 'bg-white/90 hover:bg-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${inWishlist ? 'fill-white text-white' : 'text-gray-700'}`} />
          </button>

          <img
            src={displayImage}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {category}
          </p>
          <h3 className="mt-1 text-base font-semibold text-gray-900 line-clamp-2">{name}</h3>
          
          <div className="mt-auto pt-3 flex items-end justify-between">
            <div>
              {showPrices ? (
                <span className="text-xl font-bold text-[#FF4000]">{formatPrice(displayPrice)}</span>
              ) : (
                <span className="text-sm text-muted-foreground">Precio bajo consulta</span>
              )}
            </div>
            
            {description && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="ghost"
                size="sm"
                className="gap-1 text-secondary hover:text-secondary hover:bg-secondary/10 transition-colors h-8 px-3"
              >
                <Eye className="h-4 w-4" />
                Ver más
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{name}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {/* Image - sticky to stay visible */}
            <div className="aspect-square overflow-hidden rounded-lg bg-muted md:sticky md:top-4 md:self-start">
              <img
                src={displayImage}
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Details */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Categoría
                </p>
                <p className="text-lg font-semibold">{category}</p>
              </div>

              {/* Size selector if product has multiple sizes */}
              {sizes && sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    Tamaño
                  </p>
                  <Select value={selectedSizeId || ""} onValueChange={handleSizeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={String(size.id)}>
                          {size.size} - {formatPrice(size.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {description && (
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    Descripción
                  </p>
                  <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Precio
                </p>
                {showPrices ? (
                  <p className="text-3xl font-bold text-accent">{formatPrice(displayPrice)}</p>
                ) : (
                  <p className="text-lg text-muted-foreground">Precio bajo consulta</p>
                )}
              </div>

              <Button
                onClick={handleToggleWishlist}
                className={`w-full mt-4 ${
                  inWishlist
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <Heart className={`h-5 w-5 mr-2 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'Eliminar de lista de deseos' : 'Añadir a lista de deseos'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;

