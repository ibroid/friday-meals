"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewModalButtonProps {
  productId: string;
  productName: string;
  existingReview?: {
    rating: number;
    review: string | null;
    complaint: string | null;
  } | null;
}

export default function ReviewModalButton({ productId, productName, existingReview }: ReviewModalButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [review, setReview] = useState(existingReview?.review || "");
  const [complaint, setComplaint] = useState(existingReview?.complaint || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/aftersale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          review,
          complaint
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan ulasan.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant={existingReview ? "outline" : "default"} size="sm" />}>
        {existingReview ? "Edit Ulasan" : "Tulis Ulasan"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ulasan untuk {productName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Penilaian Anda</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="review">Ulasan Produk</Label>
            <Textarea
              id="review"
              placeholder="Bagaimana pendapat Anda tentang rasa dan kualitasnya?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint">Komplain (Opsional)</Label>
            <Textarea
              id="complaint"
              placeholder="Apakah ada masalah dengan produk ini?"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Ulasan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
