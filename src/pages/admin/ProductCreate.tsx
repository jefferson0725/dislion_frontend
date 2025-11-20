import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Package, X, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import apiFetch from "../../utils/api";
import { getToken } from "../../utils/tokenStore";
import { toast } from "../../hooks/use-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import { AuthContext } from "../../context/AuthContext";

const ProductCreate: React.FC = () => {
  const auth = useContext(AuthContext)!;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Array<any>>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load categories from local data.json
    (async () => {
      try {
        const res = await axios.get('/data.json');
        const data = res.data;
        setCategories(data.categories || []);
      } catch (err: any) {
        setError(err.message || "Error cargando categorias");
      }
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Validate category selection
      if (!categoryId || categoryId === "0") {
        throw new Error("Debes seleccionar una categoría");
      }

      // First create the product without image
      const payload: any = { name, description, price: Number(price) };
      if (categoryId && categoryId !== "0") payload.categoryId = Number(categoryId);

      const res = await apiFetch(`/api/products`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creando producto");

      // If there's an image file selected, upload it with product ID and name
      if (imageFile && data.id) {
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const sanitizedName = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60);
        const filename = `${data.id}-${sanitizedName}.${ext}`;

        setUploadingImage(true);
        setUploadProgress(0);
        
        const t = toast({ title: "Guardando imagen", description: `0%` });
        
        try {
          const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:4000";
          const token = getToken();
          
          const form = new FormData();
          form.append("image", imageFile);
          form.append("filename", filename);

          const uploadRes = await axios.post(
            `${API_ROOT}/uploads/frontend`,
            form,
            {
              headers: token ? { "Authorization": `Bearer ${token}` } : {},
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / (progressEvent.total || 100)
                );
                setUploadProgress(percentCompleted);
                t.update({ id: t.id, description: `${percentCompleted}%` });
              },
            }
          );

          const savedFilename = uploadRes.data.filename || filename;

          setUploadingImage(false);
          setUploadProgress(100);
          t.update({ id: t.id, title: "Imagen guardada", description: "Listo" });
          
          // Update product with image filename
          const updateRes = await apiFetch(`/api/products/${data.id}`, {
            method: "PUT",
            body: JSON.stringify({ image: savedFilename }),
          });
          if (!updateRes.ok) throw new Error("Error actualizando imagen del producto");
          
        } catch (uerr: any) {
          setUploadingImage(false);
          setUploadProgress(0);
          const message = uerr?.response?.data?.error || uerr?.message || "Error guardando imagen";
          t.update({ id: t.id, title: "Error al guardar imagen", description: message });
          throw new Error(message);
        }
      }

      toast({ title: "Producto creado", description: data.name || "El producto ha sido creado exitosamente" });
      setName("");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      setError(err.message || "Error");
      toast({ title: "Error", description: err.message || "Error al crear producto", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!auth?.user || auth.user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Solo administradores pueden crear productos.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Crear Producto
          </h2>
          <p className="text-gray-600 mt-1">Agrega un nuevo producto a tu catálogo</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nombre del Producto *</label>
            <Input
              type="text"
              placeholder="Ej: Laptop Dell, Camiseta Nike..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 text-base border-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Descripción</label>
            <Textarea
              placeholder="Describe los detalles del producto, características, materiales, tallas disponibles, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 text-base border-2 resize-none"
            />
            <p className="text-xs text-gray-500">{description.length}/500 caracteres</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Precio *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                $
              </span>
              <Input
                type="number"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                required
                min="0"
                step="1000"
                className="h-12 text-base border-2 pl-7"
              />
            </div>
            {price !== "" && (
              <p className="text-xs text-gray-500">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(price))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Categoría</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-12 border-2">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sin categoría</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Imagen del Producto</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-400 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="preview" 
                    className="w-full max-h-64 object-contain rounded-lg mb-4"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Quitar
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-3">Arrastra una imagen o haz clic para seleccionar</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  if (f) {
                    setImageFile(f);
                    setImagePreview(URL.createObjectURL(f));
                  }
                }}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-secondary hover:file:bg-orange-100"
              />
            </div>
          </div>

          {uploadingImage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">Subiendo imagen...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || uploadingImage}
            className="w-full sm:w-auto h-12 text-base font-semibold bg-gradient-to-r from-secondary to-orange-500 hover:from-orange-500 hover:to-secondary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            {loading || uploadingImage ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {uploadingImage ? 'Subiendo imagen...' : 'Creando...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Crear Producto
              </div>
            )}
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default ProductCreate;
