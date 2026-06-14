"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";

export default function UploadProofButton({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/orders/${orderId}/upload-proof`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload proof");
      }

      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 border bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full mt-4 text-primary border-primary hover:bg-primary/10">
        <Upload className="h-4 w-4 mr-2" /> Upload Bukti Pembayaran
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="receipt">Pilih Gambar / Foto Struk (JPG/PNG)</Label>
            <Input 
              id="receipt" 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Kirim Bukti
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
