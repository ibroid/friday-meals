import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProductDetailModal from "@/components/products/ProductDetailModal";

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      galleries: true,
      reviews: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <section className="mb-12 bg-primary/5 rounded-3xl overflow-hidden flex flex-col md:flex-row items-center border border-primary/10">
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-primary">
            Friday Meals
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
            Selamat datang di toko kami! Kami menyajikan cookies dan kue kering artisan yang dibuat 
            fresh setiap hari menggunakan bahan-bahan premium pilihan. Jadikan momen bersantaimu 
            lebih manis dan berkesan bersama kreasi terbaik dari dapur kami.
          </p>
        </div>
        <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px]">
          <Image
            src="/illustrations/cetak-kuki.webp"
            alt="Proses Pembuatan Cookies"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No products available at the moment. Please check back later.
            </div>
          ) : (
            products.map((product, index) => (
              <Card key={product.id} className="flex flex-col overflow-hidden">
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
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                  </p>
                  <p className="font-bold text-lg">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Stock: {product.stock}
                  </p>
                </CardContent>
                <CardFooter>
                  <ProductDetailModal product={{ ...product, price: Number(product.price) } as any} />
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
