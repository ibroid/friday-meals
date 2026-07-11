"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type CategoryWithCount = {
  id: string;
  name: string;
  iconUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { products: number };
};

export default function CategoryList({ initialCategories }: { initialCategories: CategoryWithCount[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  
  const [name, setName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png") {
      alert("Hanya format PNG yang diperbolehkan.");
      e.target.value = "";
      return;
    }

    if (file.size > 124 * 1024) {
      alert("Ukuran file maksimal 124KB.");
      e.target.value = "";
      return;
    }

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width !== img.height) {
        alert(`Dimensi gambar harus 1:1 (persegi). Dimensi saat ini: ${img.width}x${img.height}`);
        URL.revokeObjectURL(objectUrl);
        e.target.value = "";
        return;
      }
      if (img.width > 64 || img.height > 64) {
        alert(`Maksimal ukuran gambar adalah 64x64 pixel. Ukuran saat ini: ${img.width}x${img.height}`);
        URL.revokeObjectURL(objectUrl);
        e.target.value = "";
        return;
      }

      setIconFile(file);
      setIconPreview(objectUrl);
    };
    img.src = objectUrl;
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setName("");
    setIconFile(null);
    setIconPreview(null);
    setError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setName(category.name);
    setIconFile(null);
    setIconPreview(category.iconUrl);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let uploadedUrl = editingCategory?.iconUrl || null;

    if (iconFile) {
      const formData = new FormData();
      formData.append("file", iconFile);
      formData.append("folder", "categories");
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedUrl = uploadData.url;
        } else {
          setError("Gagal mengupload icon.");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setError("Gagal mengupload icon.");
        setIsLoading(false);
        return;
      }
    }

    const payload = {
      name,
      iconUrl: uploadedUrl,
    };

    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setIsDialogOpen(false);
        router.refresh();
      } else {
        setError(data.error || "Gagal menyimpan kategori");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (category: CategoryWithCount) => {
    if (category._count.products > 0) {
      alert("Tidak bisa menghapus kategori yang masih memiliki produk.");
      return;
    }
    if (!confirm(`Hapus kategori ${category.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus kategori");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center bg-muted/30">
        <h2 className="font-semibold">Daftar Kategori</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button onClick={openAddDialog} size="sm" />}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {error && <div className="text-sm text-destructive">{error}</div>}
              
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kategori</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon (PNG, maks 124KB, dimensi 1:1, maks 64x64 pixel)</Label>
                <Input id="icon" type="file" accept="image/png" onChange={handleIconChange} />
                {iconPreview && (
                  <div className="mt-2 w-16 h-16 relative border rounded bg-muted flex items-center justify-center overflow-hidden">
                    <Image src={iconPreview} alt="Icon Preview" fill className="object-contain p-1" sizes="64px" />
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Kategori"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Icon</TableHead>
            <TableHead>Nama Kategori</TableHead>
            <TableHead>Total Produk</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada kategori.</TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  {category.iconUrl ? (
                    <div className="w-10 h-10 relative bg-muted rounded overflow-hidden">
                      <Image src={category.iconUrl} alt={category.name} fill className="object-contain p-1" sizes="40px" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category._count.products}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(category)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
