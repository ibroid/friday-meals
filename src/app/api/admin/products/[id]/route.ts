import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import * as z from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0).int(),
  images: z.array(z.string()).optional(),
  ingredients: z.string().optional(),
  expiredDays: z.coerce.number().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        ingredients: data.ingredients,
        expiredDays: data.expiredDays,
        categoryId: data.categoryId || null,
        imageUrl: data.images && data.images.length > 0 ? data.images[0] : null,
      },
    });

    if (data.images !== undefined) {
      await prisma.productGallery.deleteMany({
        where: { productId: id }
      });
      if (data.images.length > 1) {
        await prisma.productGallery.createMany({
          data: data.images.slice(1).map(url => ({
            productId: id,
            imageUrl: url
          }))
        });
      }
    }

    return NextResponse.json({ message: "Product updated successfully", product }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input data", errors: (error as any).errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
