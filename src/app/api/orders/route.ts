import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import * as z from "zod";

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ).min(1, "Cart cannot be empty"),
  fullName: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email(),
  address: z.string().min(10),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  paymentMethod: z.enum(["TRANSFER_BANK", "QRIS"]).default("TRANSFER_BANK"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, phone, address, latitude, longitude, paymentMethod } = orderSchema.parse(body);

    // Fetch all products in the cart to verify stock and prices
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ message: "One or more products not found" }, { status: 404 });
    }

    // Verify stock and calculate total
    let total = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json({ message: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
      total += Number(product.price) * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create order and reduce stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total,
          shippingAddress: address,
          phone,
          latitude,
          longitude,
          paymentMethod,
          status: paymentMethod === "TRANSFER_BANK" ? "UNPAID" : "PENDING",
          orderItems: {
            create: orderItemsData,
          },
        },
      });

      // 2. Reduce product stock for all items
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ message: "Order placed successfully", order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input data", errors: (error as any).errors }, { status: 422 });
    }
    console.error("Order error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // If user is ADMIN, return all orders, otherwise return only user's orders
    const whereClause = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
