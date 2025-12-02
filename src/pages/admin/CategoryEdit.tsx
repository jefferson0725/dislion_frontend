import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Edit, X, Save, AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import apiFetch from "../../utils/api";
import { toast } from "../../hooks/use-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";

interface CategoryFormData {
  name: string;
  description: string;
}

const CategoryEdit: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const loadCategories = async () => {
    setError(null);
    try {
      const res = await apiFetch('/api/categories');
      if (!res.ok) throw new Error('Error loading categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message || "Error");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openEditor = (category: any) => {
    setEditing(category);
    setValue("name", category.name || "");
    setValue("description", category.description || "");
  };

  const closeEditor = () => {
    setEditing(null);
    reset();
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (!editing) return;
    setError(null);
    setLoading(true);

    try {
      const payload: any = {};
      if (data.name && data.name !== editing.name) payload.name = data.name;
      if (data.description !== editing.description) payload.description = data.description;

      const res = await apiFetch(`/api/categories/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Error actualizando categoría");

      toast({ title: "Categoría actualizada", description: "Los cambios se han guardado correctamente" });
      closeEditor();
      await loadCategories();
    } catch (err: any) {
      setError(err.message || "Error al actualizar");
      toast({ title: "Error", description: err.message || "Error al actualizar categoría", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Editar Categorías
          </h2>
          <p className="text-gray-600 mt-1">Modifica las categorías existentes</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 animate-in fade-in">
            <p className="text-gray-500 text-lg">No hay categorías para editar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((c, index) => (
              <div
                key={c.id}
                className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-6 hover:border-orange-200 hover:shadow-md transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{c.name}</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {c.description || "Sin descripción"}
                    </p>
                  </div>
                  <Button
                    onClick={() => openEditor(c)}
                    className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all hover:scale-105 active:scale-95"
                    size="sm"
                  >
                    <Pencil className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!editing} onOpenChange={(open) => !open && closeEditor()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Editar Categoría
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nombre *</label>
                <Input
                  {...register("name", { required: true })}
                  placeholder="Nombre de la categoría"
                  className="h-12 border-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Descripción</label>
                <Textarea
                  {...register("description")}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  className="border-2 resize-none"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  onClick={closeEditor}
                  variant="outline"
                  className="border-2"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Guardar
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
};

export default CategoryEdit;
