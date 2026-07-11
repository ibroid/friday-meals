"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProductDetailModal from "@/components/products/ProductDetailModal";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductWithDetails = any; // Type passed from server

export default function ProductShowcase({ 
  products, 
  categories 
}: { 
  products: ProductWithDetails[],
  categories: any[]
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategoryId === "all" || product.categoryId === selectedCategoryId;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          <Input
            placeholder="Cari menu favoritmu..."
            className="pl-9 bg-background/50 backdrop-blur-sm border-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto snap-x">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border snap-start",
                selectedCategoryId === "all" 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background/50 hover:bg-muted border-primary/20 text-foreground"
              )}
            >
              Semua Menu
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border snap-start flex items-center gap-2",
                  selectedCategoryId === cat.id 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background/50 hover:bg-muted border-primary/20 text-foreground"
                )}
              >
                {cat.iconUrl && (
                  <img src={cat.iconUrl} alt="" className={cn("w-4 h-4 object-contain", selectedCategoryId === cat.id ? "brightness-0 invert" : "")} />
                )}
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-primary/20">
            <p className="text-lg">Yahh, menunya tidak ditemukan :(</p>
            <p className="text-sm mt-1">Coba cari dengan kata kunci lain ya!</p>
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <Card key={product.id} className="flex flex-col overflow-hidden bg-background/80 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
              <div className="aspect-square relative bg-muted">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    priority={index < 4}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                    No Image
                  </div>
                )}
                {product.category && (
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium border border-primary/10 flex items-center gap-1.5 shadow-sm">
                    {product.category.iconUrl && (
                      <img src={product.category.iconUrl} alt="" className="w-3 h-3 object-contain" />
                    )}
                    {product.category.name}
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>
                <p className="font-bold text-lg text-primary">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <ProductDetailModal product={{ ...product, price: Number(product.price) }} />
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
