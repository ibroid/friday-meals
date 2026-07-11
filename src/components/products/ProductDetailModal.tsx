"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Star, Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { Product, ProductGallery, AfterSale } from "@prisma/client";

interface ProductWithRelations extends Product {
  galleries: ProductGallery[];
  reviews: AfterSale[];
}

export default function ProductDetailModal({
  product,
}: {
  product: ProductWithRelations;
}) {
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(
    product.imageUrl || "/placeholder.jpg"
  );

  const images = product.imageUrl ? [product.imageUrl] : [];
  if (product.galleries?.length > 0) {
    product.galleries.forEach((g) => images.push(g.imageUrl));
  }
  
  // Calculate average rating
  const avgRating = product.reviews?.length > 0
    ? product.reviews.reduce((acc, curr) => acc + curr.rating, 0) / product.reviews.length
    : 0;

  const handleAddToCart = () => {
    // addToCart from CartContext expects a Product, we have ProductWithRelations but it extends Product so it's fine.
    // just cast to any or Product
    addToCart(product as any);
    setOpen(false); // Optionally close the modal after adding to cart
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="w-full">Detail</Button>} />
      <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
              {currentImage !== "/placeholder.jpg" ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                  <Package className="h-12 w-12" />
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(img)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                      currentImage === img ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <p className="font-bold text-2xl text-primary mb-2">
              Rp {Number(product.price).toLocaleString("id-ID")}
            </p>
            
            <div className="flex items-center gap-1 mb-6">
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= avgRating ? "fill-current" : "text-muted-foreground opacity-30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {product.description && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {product.ingredients && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Ingredients</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {product.ingredients}
                  </p>
                </div>
              )}

              {product.expiredDays !== null && product.expiredDays !== undefined && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Masa Kedaluwarsa</h4>
                  <p className="text-sm text-muted-foreground">
                    {product.expiredDays % 30 === 0 && product.expiredDays > 0 
                      ? `${product.expiredDays / 30} bulan` 
                      : `${product.expiredDays} hari`} setelah pengiriman
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium mt-2">
                  Stock: <span className={product.stock > 0 ? "text-green-600" : "text-destructive"}>{product.stock > 0 ? product.stock : "Out of Stock"}</span>
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t">
              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> 
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
