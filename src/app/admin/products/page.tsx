import { prisma } from "@/lib/prisma";
import ProductList from "./ProductList";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: { galleries: true }
  });

  const serializedProducts = products.map((product) => ({
    ...product,
    price: Number(product.price),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Products Management</h1>
      <ProductList initialProducts={serializedProducts as any} />
    </div>
  );
}
