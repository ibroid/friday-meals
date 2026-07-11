"use client";

import { useState, useEffect } from "react";
import { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Extend Product to include galleries if passed from server
interface ProductWithGalleries extends Product {
  galleries?: { imageUrl: string }[];
  category?: { id: string; name: string; iconUrl?: string | null } | null;
  expiredDays: number | null;
}

export default function ProductList({ initialProducts, categories = [] }: { initialProducts: ProductWithGalleries[], categories?: any[] }) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithGalleries[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithGalleries | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Search and Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Sync products when server component re-renders (via router.refresh)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [expiredDays, setExpiredDays] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Array of images. Can be an existing URL (string) or a newly uploaded File
  const [images, setImages] = useState<{ url: string; file: File | null }[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const openAddDialog = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("0");
    setIngredients("");
    setExpiredDays("");
    setCategoryId("");
    setImages([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: ProductWithGalleries) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setIngredients(product.ingredients || "");
    setExpiredDays(product.expiredDays ? product.expiredDays.toString() : "");
    setCategoryId(product.categoryId || "");

    // Load existing images
    const existingImages = [];
    if (product.imageUrl) {
      existingImages.push({ url: product.imageUrl, file: null });
    }
    if (product.galleries) {
      product.galleries.forEach(g => {
        existingImages.push({ url: g.imageUrl, file: null });
      });
    }
    setImages(existingImages);
    setIsDialogOpen(true);
  };

  // Utility to resize and crop image to exactly 512x512
  const resizeAndCropImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 512;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return reject(new Error("Failed to get canvas context"));
          }

          // Calculate crop dimensions for 1:1 aspect ratio centered
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Canvas to Blob failed"));
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(newFile);
          }, file.type);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setIsUploadingImage(true);

      try {
        const newImages = await Promise.all(
          filesArray.map(async (file) => {
            const resizedFile = await resizeAndCropImage(file);
            return {
              url: URL.createObjectURL(resizedFile),
              file: resizedFile
            };
          })
        );

        setImages(prev => [...prev, ...newImages]);
      } catch (error) {
        console.error("Failed to process images", error);
        alert("Failed to process some images. Make sure they are valid image files.");
      } finally {
        setIsUploadingImage(false);
      }

      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      // Revoke object URL to avoid memory leaks
      if (newImages[index].file) {
        URL.revokeObjectURL(newImages[index].url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const finalImageUrls: string[] = [];

    // Upload all new files
    for (const image of images) {
      if (image.file) {
        setIsUploadingImage(true);
        try {
          const formData = new FormData();
          formData.append("file", image.file);
          formData.append("folder", "products");

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalImageUrls.push(uploadData.url);
          } else {
            alert("Failed to upload an image");
            setIsUploadingImage(false);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Upload error", error);
          alert("Upload error");
          setIsUploadingImage(false);
          setIsLoading(false);
          return;
        }
      } else {
        // Existing image
        finalImageUrls.push(image.url);
      }
    }

    setIsUploadingImage(false);

    const payload = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      images: finalImageUrls,
      ingredients,
      expiredDays: expiredDays ? Number(expiredDays) : null,
      categoryId: categoryId || null,
    };

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        router.refresh();

        // Let's do a hard refresh to get the updated data from server since galleries are complex
        // router.refresh() will take care of re-fetching Server Components
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">All Products</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button onClick={openAddDialog} />}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={(val) => setCategoryId(val || "")}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih kategori">
                      {categoryId ? categories.find(c => c.id === categoryId)?.name : "Pilih kategori"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tanpa Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients</Label>
                <Textarea id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={3} placeholder="e.g. Flour, Sugar, Butter" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiredDays">Masa Kedaluwarsa (Hari)</Label>
                <Input type="number" id="expiredDays" min="0" placeholder="Berapa hari setelah produk dikirim?" value={expiredDays} onChange={(e) => setExpiredDays(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Rp)</Label>
                  <Input id="price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Product Images (Automatically cropped to 1:1, 512x512)</Label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-md overflow-hidden border">
                      <img src={img.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <label className="border-2 border-dashed rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground text-center px-2">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
                {isUploadingImage && <p className="text-sm text-muted-foreground">Processing images...</p>}
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading || isUploadingImage}>
                {isLoading || isUploadingImage ? "Saving..." : "Save Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.category ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {product.category.iconUrl && (
                          <img src={product.category.iconUrl} alt="" className="w-4 h-4 object-contain" />
                        )}
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>Rp {Number(product.price).toLocaleString("id-ID")}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
