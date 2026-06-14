import { prisma } from "@/lib/prisma";
import OrderList from "./OrderList";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
      orderItems: {
        include: { product: true },
      },
    },
  });

  const plainOrders = orders.map((order) => ({
    ...order,
    total: Number(order.total),
    orderItems: order.orderItems.map((item) => ({
      ...item,
      price: Number(item.price),
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
    })),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Orders</h1>
      <OrderList initialOrders={plainOrders as any} />
    </div>
  );
}
