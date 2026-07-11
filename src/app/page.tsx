import { prisma } from "@/lib/prisma";
import Image from "next/image";
import ProductShowcase from "@/components/products/ProductShowcase";

export default async function Home() {
  const categories = await prisma.foodCategory.findMany({
    orderBy: { name: "asc" }
  });

  const productsData = await prisma.product.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      galleries: true,
      reviews: true,
      category: true,
    },
  });

  const products = productsData.map((product) => ({
    ...product,
    price: Number(product.price),
  }));

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
        <ProductShowcase products={products} categories={categories} />
      </section>
    </div>
  );
}
