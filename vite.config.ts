import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      // Watch for changes in public folder (including data.json)
      ignored: ['!**/public/**'],
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React y TODAS las librerías que dependen de React deben estar juntas
            // para garantizar el orden correcto de carga
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('scheduler') ||
                id.includes('react-router') ||
                id.includes('framer-motion') ||
                id.includes('motion') ||
                id.includes('@radix-ui') ||
                id.includes('@dnd-kit') ||
                id.includes('react-hook-form') ||
                id.includes('@hookform') ||
                id.includes('react-day-picker') ||
                id.includes('@tanstack/react-query') ||
                id.includes('recharts')) {
              return 'vendor-react';
            }
            
            // Utilidades sin dependencia de React
            if (id.includes('class-variance-authority') ||
                id.includes('clsx') ||
                id.includes('tailwind-merge') ||
                id.includes('date-fns') ||
                id.includes('zod') ||
                id.includes('d3-') ||
                id.includes('lucide-react')) {
              return 'vendor-utils';
            }
            
            // Resto de vendor
            return 'vendor';
          }
        },
      },
    },
  },
}));
