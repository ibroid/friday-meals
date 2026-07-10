import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const afterSaleSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().min(1).max(5),
  review: z.string().optional().nullable(),
  complaint: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = afterSaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    // Check if user has already reviewed this product
    const existing = await prisma.afterSale.findFirst({
      where: {
        userId: session.user.id,
        productId: data.productId,
      },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.afterSale.update({
        where: { id: existing.id },
        data: {
          rating: data.rating,
          review: data.review || null,
          complaint: data.complaint || null,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      // Create new
      const created = await prisma.afterSale.create({
        data: {
          userId: session.user.id,
          productId: data.productId,
          rating: data.rating,
          review: data.review || null,
          complaint: data.complaint || null,
        },
      });
      return NextResponse.json({ success: true, data: created });
    }
  } catch (error) {
    console.error("AfterSale POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
