import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Pencil, X, Save, AlertCircle, Trash2, Image as ImageIcon, Search, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import apiFetch, { apiClient } from "../../utils/api";
import { getToken } from "../../utils/tokenStore";
import { toast } from "../../hooks/use-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import { AuthContext } from "../../context/AuthContext";
import { formatPrice } from "../../utils/formatPrice";

interface SortableProductProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
}

function SortableProduct({ product, onEdit, onDelete }: SortableProductProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-6 hover:border-orange-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
          title="Arrastra para reordenar"
        >
          <GripVertical className="w-6 h-6 text-gray-400 hover:text-gray-600" />
        </div>

        {product.image && (
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={`/images/${product.image}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
          <p className="text-base sm:text-lg font-semibold text-secondary mb-1">
            {formatPrice(product.price)}
          </p>
          <p className="text-sm text-gray-600">
            Categoría: {product.category?.name || "Sin categoría"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => onEdit(product)}
            className="flex-shrink-0 bg-gradient-to-r from-secondary to-orange-500 hover:from-orange-500 hover:to-secondary transition-all hover:scale-105 active:scale-95"
            size="sm"
          >
            <Pencil className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            onClick={() => onDelete(product)}
            variant="destructive"
            className="flex-shrink-0 hover:scale-105 active:scale-95 transition-all"
            size="sm"
          >
            <Trash2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Eliminar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

const ProductEdit: React.FC = () => {
  const auth = useContext(AuthContext)!;
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await axios.get('/data.json');
      const data = res.data;
      setCategories(data.categories || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const load = async () => {
    setError(null);
    try {
      const res = await apiFetch(`/api/products`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Error");
    }
  };

  const openEditor = (p: any) => {
    setEditing(p);
    setName(p.name || "");
    setDescription(p.description || "");
    setPrice(p.price ?? "");
    setCategoryId(p.categoryId ? String(p.categoryId) : "0");
    setImagePreview(p.image ? `/images/${p.image}` : null);
    setImageFile(null);
    setUploadProgress(0);
    setDialogOpen(true);
  };

  const closeEditor = () => {
    setDialogOpen(false);
    setEditing(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar producto");
      }
      toast({ title: "Producto eliminado", description: `${productToDelete.name} ha sido eliminado` });
      await load();
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al eliminar producto", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex);
      
      // Actualizar el estado local inmediatamente
      setProducts(newProducts);

      // Actualizar displayOrder en el backend
      try {
        const updates = newProducts.map((p, idx) => ({
          id: p.id,
          displayOrder: idx
        }));

        for (const update of updates) {
          await apiFetch(`/api/products/${update.id}`, {
            method: "PUT",
            body: JSON.stringify({ displayOrder: update.displayOrder }),
          });
        }

        toast({ title: "Orden actualizado", description: "El orden de los productos ha sido guardado" });
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Error al actualizar orden", variant: "destructive" });
        await load();
      }
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    try {
      // Validate category selection
      if (!categoryId || categoryId === "0") {
        throw new Error("Debes seleccionar una categoría");
      }

      const payload: any = {};
      if (name) payload.name = name;
      if (description) payload.description = description;
      if (price !== "") payload.price = Number(price);
      if (categoryId !== "" && categoryId !== "0") payload.categoryId = Number(categoryId);

      // If new image selected, upload first
      if (imageFile) {
        setUploadingImage(true);
        setUploadProgress(0);
        const token = getToken();
        const t = toast({ title: "Guardando imagen", description: `0%` });

        // Generate filename with product ID and name
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const sanitizedName = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60);
        const filename = `${editing.id}-${sanitizedName}.${ext}`;

        try {
          const form = new FormData();
          form.append("image", imageFile);
          form.append("filename", filename);

          const uploadRes = await apiClient.post(
            `/api/uploads/frontend`,
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

          payload.image = savedFilename;
        } catch (uerr: any) {
          setUploadingImage(false);
          setUploadProgress(0);
          const message = uerr?.response?.data?.error || uerr?.message || "Error subiendo imagen";
          t.update({ id: t.id, title: "Error al guardar imagen", description: message });
          throw new Error(message);
        }
      }

      const res = await apiFetch(`/api/products/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error updating product");
      toast({ title: "Producto actualizado", description: data.name });
      await load();
      closeEditor();
    } catch (err: any) {
      setError(err.message || "Error");
      toast({ title: "Error", description: err.message || "Error al actualizar producto", variant: "destructive" });
    }
  };

  if (!auth?.user || auth.user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Solo administradores pueden editar productos.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Editar Productos
          </h2>
          <p className="text-gray-600 mt-1">Modifica o elimina productos existentes</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {products.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 border-2 pl-12 text-base"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {products.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).length} de {products.length} productos
            </p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No hay productos para editar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products
              .filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No hay productos que coincidan con tu búsqueda</p>
              </div>
            ) : searchQuery === "" ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={products.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {products.map((p) => (
                    <SortableProduct
                      key={p.id}
                      product={p}
                      onEdit={openEditor}
                      onDelete={(product) => {
                        setProductToDelete(product);
                        setDeleteConfirmOpen(true);
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              products
                .filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((p) => (
              <div
                key={p.id}
                className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-6 hover:border-orange-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {p.image && (
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={`/images/${p.image}`} 
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{p.name}</h3>
                    <p className="text-base sm:text-lg font-semibold text-secondary mb-1">
                      {formatPrice(p.price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Categoría: {p.category?.name || "Sin categoría"}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => openEditor(p)}
                      className="flex-shrink-0 bg-gradient-to-r from-secondary to-orange-500 hover:from-orange-500 hover:to-secondary transition-all hover:scale-105 active:scale-95"
                      size="sm"
                    >
                      <Pencil className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setProductToDelete(p);
                        setDeleteConfirmOpen(true);
                      }}
                      variant="destructive"
                      className="flex-shrink-0 hover:scale-105 active:scale-95 transition-all"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </div>
                ))
            )}
          </div>
        )}

        {/* Dialog de edición */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Editar Producto
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nombre *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del producto"
                  className="h-12 border-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Descripción</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe los detalles del producto, características, materiales, tallas disponibles, etc."
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
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className="h-12 border-2 pl-7"
                  />
                </div>
                {price !== "" && (
                  <p className="text-xs text-gray-500">
                    {formatPrice(Number(price))}
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
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                onClick={closeEditor}
                variant="outline"
                className="border-2"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || uploadingImage}
                className="bg-gradient-to-r from-secondary to-orange-500 hover:from-orange-500 hover:to-secondary transition-all hover:scale-105 active:scale-95"
              >
                {loading || uploadingImage ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {uploadingImage ? 'Subiendo...' : 'Guardando...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Guardar
                  </div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmación de eliminación */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ¿Eliminar producto?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                ¿Estás seguro de que deseas eliminar <strong>{productToDelete?.name}</strong>? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-2">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </div>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
};

export default ProductEdit;
