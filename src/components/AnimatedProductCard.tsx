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
    // Stagger limitado: máximo 0.4s de delay
    const staggerDelay = Math.min(index * 0.03, 0.4);

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
          y: 20
        }}
        animate={isInView ? {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            delay: staggerDelay,
            ease: "easeOut"
          }
        } : {}}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.15 }
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
