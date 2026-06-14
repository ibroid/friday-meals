import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AddToCartButton from "@/components/products/AddToCartButton";

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Freshly Baked Cookies
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Order your favorite cookies now and get them delivered straight to your door.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  {product.stock > 0 ? (
                    <AddToCartButton product={{ ...product, price: Number(product.price) } as any} />
                  ) : (
                    <Button className="w-full" disabled>Out of Stock</Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
