import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye, X } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useWishlist } from "../hooks/useWishlist";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
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
  const [modalImage, setModalImage] = useState<string>(image);
  const [modalPrice, setModalPrice] = useState<number>(price);
  const [imageTransition, setImageTransition] = useState(false);
  
  // Lazy loading state for card image
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

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

  // No auto-select first size - user must select manually

  // Reset modal image and price when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setModalImage(image);
      setModalPrice(price);
      setSelectedSizeId(null);
      setSelectedSize(null);
    }
  }, [isDialogOpen, image, price]);

  // Update selected size when size changes
  const handleSizeChange = (sizeId: string) => {
    // Trigger fade out animation
    setImageTransition(true);
    
    setTimeout(() => {
      if (sizeId === "original") {
        // User selected the original product
        setSelectedSizeId(null);
        setSelectedSize(null);
        setModalImage(image);
        setModalPrice(price);
      } else {
        setSelectedSizeId(sizeId);
        const size = sizes.find(s => String(s.id) === sizeId);
        setSelectedSize(size || null);
        
        // Update modal image and price
        if (size) {
          setModalImage(size.image || image);
          setModalPrice(size.price);
        }
      }
      
      // Trigger fade in animation
      setTimeout(() => setImageTransition(false), 50);
    }, 200);
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
        image, // Always use the card image for wishlist
        name, 
        price: selectedSize ? selectedSize.price : price, 
        category,
        selectedSize: selectedSize || null,
        uniqueKey
      });
    }
  };

  // Determine the display price and image for the CARD (not modal)
  const displayPrice = price;
  const displayImage = image;

  return (
    <>
      <Card className="group overflow-hidden border border-gray-200 bg-white shadow-md hover:shadow-xl hover:shadow-[#0A1045]/15 transition-all duration-300 flex flex-col h-full hover:scale-[1.02]">
        <div 
          className="aspect-square overflow-hidden bg-gray-100 cursor-pointer relative"
          onClick={() => description && setIsDialogOpen(true)}
        >
          {/* Skeleton loader */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" 
                   style={{ backgroundSize: '200% 100%' }} />
            </div>
          )}
          
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
            ref={imgRef}
            src={displayImage}
            alt={name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Error fallback */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">Sin imagen</span>
            </div>
          )}
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
          {/* Sticky close button - always visible */}
          <div className="sticky top-0 z-50 flex justify-end pointer-events-none">
            <DialogClose className="pointer-events-auto rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none bg-background/95 backdrop-blur-sm p-2 border border-border shadow-sm hover:shadow-md">
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </DialogClose>
          </div>
          
          {/* Regular header - scrolls with content */}
          <DialogHeader className="-mt-10">
            <DialogTitle className="text-2xl font-bold pr-10">{name}</DialogTitle>
            <DialogDescription className="sr-only">
              Detalles del producto {name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {/* Image - sticky to stay visible */}
            <div className="aspect-square overflow-hidden rounded-lg bg-muted md:sticky md:top-4 md:self-start relative">
              <img
                src={modalImage}
                alt={name}
                className={`h-full w-full object-cover transition-all duration-300 ${
                  imageTransition 
                    ? 'opacity-0 scale-95' 
                    : 'opacity-100 scale-100'
                }`}
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
                  <Select value={selectedSizeId || "original"} onValueChange={handleSizeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">
                        {showPrices ? `Original - ${formatPrice(price)}` : 'Original'}
                      </SelectItem>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={String(size.id)}>
                          {showPrices ? `${size.size} - ${formatPrice(size.price)}` : size.size}
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
                  <p className={`text-3xl font-bold text-accent transition-all duration-300 ${
                    imageTransition 
                      ? 'opacity-0 translate-y-2' 
                      : 'opacity-100 translate-y-0'
                  }`}>
                    {formatPrice(modalPrice)}
                  </p>
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

