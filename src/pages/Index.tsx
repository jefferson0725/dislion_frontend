import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Menu, X, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import AnimatedProductCard from "@/components/AnimatedProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import WhatsAppButton from "@/components/WhatsAppButton";
import WishlistDrawer from "@/components/WishlistDrawer";
import Footer from "@/components/Footer";
import { useWishlist } from "@/hooks/useWishlist";
import { useDataVersion } from "@/hooks/useDataVersion";
import heroBanner from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

// products will be loaded from local JSON file

const Index = () => {
  const { wishlist } = useWishlist();
  // Auto-reload when data.json changes (checks every 5 seconds)
  useDataVersion(5000);
  
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const handleMenuToggle = () => {
    if (isMobileMenuOpen) {
      setIsMenuClosing(true);
      setTimeout(() => {
        setIsMobileMenuOpen(false);
        setIsMenuClosing(false);
      }, 200);
    } else {
      setIsMobileMenuOpen(true);
      setIsMenuClosing(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMenuClosing(false);
    }, 200);
  };

  // Load categories from local JSON
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingCategories(true);
      setCategoriesError(null);
      try {
        const response = await axios.get('/data.json');
        const data = response.data;
        if (!mounted) return;
        
        const names = Array.isArray(data.categories) ? data.categories.map((c: any) => c.name).filter(Boolean) : [];
        setCategories(["Todos", ...names]);
      } catch (err: any) {
        if (!mounted) return;
        setCategoriesError(err.message || "Error loading categories");
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Scroll listener for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load products from local JSON
  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      setLoadingProducts(true);
      setProductsError(null);
      try {
        const response = await axios.get('/data.json');
        const data = response.data;
        if (!mounted) return;
        
        // Transform products to use local image paths
        const productsData = Array.isArray(data.products) ? data.products.map((p: any) => ({
          ...p,
          image: p.image ? `/images/${p.image}` : null,
          sizes: p.sizes ? p.sizes.map((s: any) => ({
            ...s,
            image: s.image ? `/images/${s.image}` : null
          })) : []
        })) : [];
        
        setProducts(productsData);
      } catch (err: any) {
        if (!mounted) return;
        setProductsError(err.message || "Error loading products");
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = products.filter((product) => {
      const productCategory = product?.category?.name || product?.category || "";
      const matchesCategory = activeCategory === "Todos" || productCategory === activeCategory;
      const matchesSearch = String(product.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-only hamburger button - always visible, aligned with navbar */}
      <button
        onClick={handleMenuToggle}
        className={`md:hidden fixed top-4 right-4 z-50 p-2 rounded-full shadow-lg transition-all ${
          isMobileMenuOpen ? 'bg-secondary text-white hover:bg-secondary/90' : 'bg-white hover:bg-gray-100'
        }`}
      >
        <div className="relative w-6 h-6">
          <Menu 
            className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`} 
          />
          <X 
            className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            }`} 
          />
        </div>
      </button>

      {/* Mobile dropdown menu */}
      {(isMobileMenuOpen || isMenuClosing) && (
        <div 
          className="md:hidden fixed top-16 right-4 z-50 bg-white rounded-lg shadow-xl border border-black/10 w-80 max-w-[calc(100vw-2rem)] origin-top-right"
          style={{
            animation: isMenuClosing ? 'scaleOut 0.2s ease-in' : 'scaleIn 0.2s ease-out'
          }}
        >
          <style>{`
            @keyframes scaleIn {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            @keyframes scaleOut {
              from {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
              to {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
            }
          `}</style>
          <div className="px-4 py-4 space-y-4">
            {/* Mobile search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="h-10 pl-10 pr-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Mobile wishlist button */}
            <button
              onClick={() => {
                setIsWishlistOpen(true);
                handleMenuToggle();
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart className={`h-5 w-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
                <span className="text-sm font-medium text-foreground">Lista de Deseos</span>
              </div>
              {wishlist.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Mobile categories */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Categorías</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-secondary text-white'
                        : 'bg-secondary/20 text-foreground hover:bg-secondary/30'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar - always visible */}
      <nav className="fixed top-0 left-0 right-0 z-40 shadow-md bg-[#0A1045]">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src={heroBanner} 
              alt="DISLION" 
              className="h-12 md:h-14 w-auto object-contain"
            />
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div 
                  key="search-input"
                  className="relative"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar productos..."
                    className="h-10 pl-10 pr-10 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    onBlur={() => {
                      if (searchQuery === "") {
                        setIsSearchOpen(false);
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.button
                  key="search-button"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="h-5 w-5 text-white" />
                </motion.button>
              )}
            </AnimatePresence>
            
            {/* Wishlist button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95"
              title="Lista de deseos"
            >
              <Heart className={`h-5 w-5 ${wishlist.length > 0 ? 'fill-[#FF4000] text-[#FF4000]' : 'text-white'}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4000] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden bg-[#0A1045]">
        <motion.div 
          className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="mb-4 text-3xl font-bold md:text-5xl font-hero tracking-wider text-white"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            TU SOLUCIÓN <span className="text-[#FF4000]">ESTRATÉGICA</span>
          </motion.h1>
          <motion.p 
            className="text-base font-medium md:text-lg text-white/90"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Nuestro catalogo de productos premium a tu alcance
          </motion.p>
        </motion.div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12">
        {/* Category Filter - Hidden on mobile */}
        <motion.section 
          className="mb-12 hidden md:block"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
            <motion.div 
            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg"
            whileHover={{ scale: 1.01, boxShadow: "0 25px 50px -12px rgba(10, 16, 69, 0.15)" }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="mb-6 text-center text-3xl font-bold text-foreground">
              Categorías
            </h2>
            {loadingCategories ? (
              <p className="text-center text-muted-foreground">Cargando categorías...</p>
            ) : categoriesError ? (
              <p className="text-center text-destructive">{categoriesError}</p>
            ) : (
              <CategoryFilter categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            )}
          </motion.div>
        </motion.section>

        {/* Products Grid */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {activeCategory === "Todos" ? "Todos los Productos" : activeCategory}
            </h2>
            <p className="text-muted-foreground">
              {filteredProducts.length} productos
            </p>
          </div>
          <motion.div 
            key={activeCategory}
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6"
          >
            {filteredProducts.map((product, index) => (
              <AnimatedProductCard 
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </motion.div>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-xl text-muted-foreground">
                No se encontraron productos
              </p>
            </div>
          )}
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* WhatsApp Button */}
      <WhatsAppButton />
      
      {/* Wishlist Drawer */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </div>
  );
};

export default Index;
