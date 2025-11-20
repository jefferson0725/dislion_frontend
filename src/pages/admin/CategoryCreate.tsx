import React, { useState } from "react";
import { PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import apiFetch from "../../utils/api";
import AdminRoute from "../../components/AdminRoute";
import { toast } from "../../hooks/use-toast";

const CategoryCreate: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!name || !name.trim()) {
        setError("El nombre es requerido");
        toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
        return;
      }
      const res = await apiFetch(`/api/categories`, {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creando categoria");
      
      toast({ title: "Categoría creada", description: data.name || "La categoría ha sido creada exitosamente" });
      setName("");
      setDescription("");
    } catch (err: any) {
      setError(err.message || "Error");
      toast({ title: "Error", description: err.message || "Error al crear categoría", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Crear Categoría
          </h2>
          <p className="text-gray-600 mt-1">Agrega una nueva categoría para organizar tus productos</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nombre de la Categoría *</label>
            <Input
              type="text"
              placeholder="Ej: Electrónica, Ropa, Alimentos..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 text-base border-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Descripción (Opcional)</label>
            <Textarea
              placeholder="Describe brevemente esta categoría..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="text-base border-2 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto h-12 text-base font-semibold bg-gradient-to-r from-secondary to-orange-500 hover:from-orange-500 hover:to-secondary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Crear Categoría
              </div>
            )}
          </Button>
        </form>
      </div>
    </AdminRoute>
  );
};

export default CategoryCreate;
