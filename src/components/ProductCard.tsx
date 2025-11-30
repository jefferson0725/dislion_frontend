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
import { motion, AnimatePresence } from "framer-motion";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        whileHover={{ 
          scale: 1.03,
          transition: { duration: 0.2, type: "spring", stiffness: 300 }
        }}
      >
        <Card className="group overflow-hidden border-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
          <motion.div 
            layoutId={`product-image-${id}`}
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
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </motion.div>
        
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {category}
          </p>
          <h3 className="mt-1 text-base font-semibold text-gray-900 line-clamp-2">{name}</h3>
          
          <div className="mt-auto pt-3 flex items-end justify-between">
            <div>
              {showPrices ? (
                <span className="text-xl font-bold text-gray-900">{formatPrice(price)}</span>
              ) : (
                <span className="text-sm text-gray-600">Precio bajo consulta</span>
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
      </motion.div>

      {/* Product Detail Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{name}</DialogTitle>
              </DialogHeader>
              <motion.div 
                className="grid md:grid-cols-2 gap-6 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {/* Image with shared layout - sticky to stay visible */}
                <motion.div 
                  layoutId={`product-image-${id}`}
                  className="aspect-square overflow-hidden rounded-lg bg-muted md:sticky md:top-4 md:self-start"
                  transition={{ 
                    duration: 0.6, 
                    ease: [0.43, 0.13, 0.23, 0.96] // Custom easing for smooth transition
                  }}
                >
                  <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                </motion.div>
                
                {/* Details with stagger animation */}
                <motion.div 
                  className="flex flex-col gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        delayChildren: 0.4,
                        staggerChildren: 0.15
                      }
                    }
                  }}
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { 
                        opacity: 1, 
                        x: 0,
                        transition: { duration: 0.4, ease: "easeOut" }
                      }
                    }}
                  >
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                      Categoría
                    </p>
                    <p className="text-lg font-semibold">{category}</p>
                  </motion.div>
                  
                  {description && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        visible: { 
                          opacity: 1, 
                          x: 0,
                          transition: { duration: 0.4, ease: "easeOut" }
                        }
                      }}
                    >
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                        Descripción
                      </p>
                      <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                        {description}
                      </p>
                    </motion.div>
                  )}
                  
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { 
                        opacity: 1, 
                        x: 0,
                        transition: { duration: 0.4, ease: "easeOut" }
                      }
                    }}
                  >
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
                      Precio
                    </p>
                    {showPrices ? (
                      <p className="text-3xl font-bold text-accent">{formatPrice(price)}</p>
                    ) : (
                      <p className="text-lg text-muted-foreground">Precio bajo consulta</p>
                    )}
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { 
                        opacity: 1, 
                        y: 0,
                        transition: { duration: 0.4, ease: "easeOut" }
                      }
                    }}
                  >
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
                  </motion.div>
                </motion.div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;

