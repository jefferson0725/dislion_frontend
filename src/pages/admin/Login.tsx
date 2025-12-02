import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogIn, Lock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import apiFetch from "../../utils/api";
import heroBanner from "@/assets/logo.png";
import { motion } from "framer-motion";

interface LoginFormData {
  identifier: string;
  password: string;
}

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    mode: "onSubmit"
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      setLoading(true);
      const res = await apiFetch(`/api/users/login`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Login failed");

      login(responseData.token, responseData.refreshToken, responseData.user);
      
      // Start transition animation
      setIsTransitioning(true);
      
      // Wait for animation before navigating
      setTimeout(() => {
        if (responseData.user && responseData.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/products/create");
        }
      }, 800);
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0A1045]"
      initial={{ opacity: 1 }}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={heroBanner} 
            alt="DISLION" 
            className="h-24 mx-auto object-contain mb-4"
          />
          <motion.h1 
            className="text-3xl font-bold text-white" 
            style={{ fontFamily: 'Poppins, sans-serif' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Panel de Administración
          </motion.h1>
          <motion.p 
            className="text-gray-300 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Ingresa tus credenciales para continuar
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div 
          className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username/Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Usuario o Correo
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ingresa tu usuario o email"
                  {...register("identifier", { required: true })}
                  className="h-12 pl-4 pr-4 text-base border-2 border-gray-200 focus:border-[#0A1045] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  {...register("password", { required: true })}
                  className="h-12 pl-4 pr-4 text-base border-2 border-gray-200 focus:border-[#0A1045] transition-colors"
                />
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-[#0A1045] hover:bg-[#0A1045]/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando sesión...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </div>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p 
          className="text-center text-sm text-gray-300 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          © 2025 DISLION - Todos los derechos reservados
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Login;
