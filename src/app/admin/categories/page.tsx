import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryList from "./CategoryList";

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const categories = await prisma.foodCategory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Food Categories</h1>
      </div>
      <CategoryList initialCategories={categories} />
    </div>
  );
}
