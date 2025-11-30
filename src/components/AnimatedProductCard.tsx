import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, forwardRef } from "react";
import ProductCard from "./ProductCard";

interface AnimatedProductCardProps {
  product: any;
  index: number;
}

const AnimatedProductCard = forwardRef<HTMLDivElement, AnimatedProductCardProps>(
  ({ product, index }, forwardedRef) => {
    const internalRef = useRef(null);
    const isInView = useInView(internalRef, { 
      once: true, 
      margin: "50px 0px",
      amount: 0.1
    });

    const categoryName = product?.category?.name || product?.category || "";
    // Stagger secuencial: efecto baraja de cartas
    const staggerDelay = index * 0.06;

    return (
      <motion.div
        ref={(node) => {
          // Assign to internal ref for useInView
          (internalRef as any).current = node;
          // Forward ref if provided
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        initial={{ 
          opacity: 0, 
          x: -80,
          rotateY: -20,
          rotateZ: -5
        }}
        animate={isInView ? {
          opacity: 1,
          x: 0,
          rotateY: 0,
          rotateZ: 0,
          transition: {
            duration: 0.4,
            delay: staggerDelay,
            ease: [0.22, 0.61, 0.36, 1]
          }
        } : {}}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        <ProductCard
          id={product.id}
          image={product.image || "/placeholder.svg"}
          name={product.name}
          description={product.description}
          price={parseFloat(product.price)}
          category={categoryName}
          sizes={product.sizes || []}
        />
      </motion.div>
    );
  }
);

AnimatedProductCard.displayName = "AnimatedProductCard";

export default AnimatedProductCard;
