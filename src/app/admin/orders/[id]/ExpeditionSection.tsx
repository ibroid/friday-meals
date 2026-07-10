"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, MapPin, Phone, User, Link as LinkIcon, Trash, Edit } from "lucide-react";
import Image from "next/image";

export default function ExpeditionSection({ order, initialExpedition }: { order: any, initialExpedition: any }) {
  const router = useRouter();
  const [expedition, setExpedition] = useState(initialExpedition);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    namaTujuan: expedition?.namaTujuan || order.user.name,
    nomorTelepon: expedition?.nomorTelepon || order.phone,
    alamatTujuan: expedition?.alamatTujuan || order.shippingAddress,
    nomorResi: expedition?.nomorResi || "",
    jenisEkspedisi: expedition?.jenisEkspedisi || "",
    hasilFotoUrl: expedition?.hasilFotoUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalPhotoUrl = formData.hasilFotoUrl;

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: uploadData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          finalPhotoUrl = url;
        } else {
          alert("Gagal mengupload foto");
          setIsSubmitting(false);
          return;
        }
      }

      const method = expedition ? "PUT" : "POST";
      const res = await fetch(`/api/admin/orders/${order.id}/expedition`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, hasilFotoUrl: finalPhotoUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        setExpedition(data.expedition);
        setIsEditing(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save expedition data");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving expedition data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus data ekspedisi ini?")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/expedition`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExpedition(null);
        setIsEditing(false);
        router.refresh();
      } else {
        alert("Failed to delete expedition data");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!expedition && !isEditing) {
    return (
      <div className="border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Truck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Data Ekspedisi Kosong</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">Belum ada data pengiriman untuk pesanan ini. Buat data baru untuk mulai melacak pengiriman.</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>Buat Data Ekspedisi</Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {expedition ? "Edit Data Ekspedisi" : "Buat Data Ekspedisi"}
          </h3>
          <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Batal</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Info Tujuan</h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Tujuan</label>
              <Input name="namaTujuan" value={formData.namaTujuan} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Telepon</label>
              <Input name="nomorTelepon" value={formData.nomorTelepon} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alamat Tujuan</label>
              <textarea 
                name="alamatTujuan" 
                value={formData.alamatTujuan} 
                onChange={handleChange} 
                className="w-full min-h-[100px] flex rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Info Ekspedisi</h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Kurir / Jenis Ekspedisi</label>
              <Input name="jenisEkspedisi" placeholder="Contoh: JNE, J&T, GoSend..." value={formData.jenisEkspedisi} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Resi</label>
              <Input name="nomorResi" placeholder="Masukkan nomor resi jika ada" value={formData.nomorResi} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Foto Resi / Barang (Opsional)</label>
              {formData.hasilFotoUrl && !file && (
                <div className="relative w-32 h-32 rounded-md overflow-hidden border mb-2">
                  <Image src={formData.hasilFotoUrl} alt="Foto" fill className="object-cover" />
                </div>
              )}
              <Input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          {expedition && (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              Hapus Data
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Data Ekspedisi"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
      <div className="bg-primary/5 border-b p-4 flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Detail Pengiriman
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Informasi Penerima</p>
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{expedition.namaTujuan}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>{expedition.nomorTelepon}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{expedition.alamatTujuan}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status Kurir</p>
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Kurir / Layanan</p>
                <p className="font-semibold text-lg">{expedition.jenisEkspedisi || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nomor Resi</p>
                <p className="font-mono font-bold tracking-wider">{expedition.nomorResi || "-"}</p>
              </div>
              
              {expedition.hasilFotoUrl && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <LinkIcon className="h-3 w-3" /> Foto Resi / Barang
                  </p>
                  <a href={expedition.hasilFotoUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full h-40 rounded-md overflow-hidden border border-primary/20 hover:border-primary transition-colors">
                    <Image src={expedition.hasilFotoUrl} alt="Foto Pengiriman" fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
