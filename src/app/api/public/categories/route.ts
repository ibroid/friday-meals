import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.foodCategory.findMany({
      where: {
        iconUrl: { not: null },
      },
      select: {
        id: true,
        name: true,
        iconUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
