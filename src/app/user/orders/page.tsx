import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import UploadProofButton from "./UploadProofButton";
import NomorRekeningList from "./NomorRekeningList";
import ReviewModalButton from "./ReviewModalButton";
import Image from "next/image";
import { Package } from "lucide-react";

export default async function UserOrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const isSuccess = searchParams.success === "true";

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  const afterSales = await prisma.afterSale.findMany({
    where: { userId: session.user.id },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {isSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6">
          Thank you! Your order has been placed successfully.
        </div>
      )}

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">You haven't placed any orders yet.</p>
        ) : (
          orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.slice(-6).toUpperCase()}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "PPP p")}
                  </p>
                </div>
                <Badge variant={order.status === "PENDING" ? "secondary" : "default"}>
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4 mb-6">
                  {order.orderItems.map((item: any) => {
                    const existingReview = afterSales.find((a) => a.productId === item.productId);
                    return (
                      <div key={item.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {item.product.imageUrl ? (
                            <div className="w-12 h-12 relative rounded overflow-hidden border">
                              <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="48px" className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center border">
                              <Package className="h-4 w-4 text-muted-foreground/50" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Rp {Number(item.price).toLocaleString("id-ID")} x {item.quantity}</p>
                            {(order.status === "SHIPPED" || order.status === "DELIVERED") && item.expiredDate && (
                              <p className="text-xs font-medium text-orange-600 mt-1">
                                Exp: {format(new Date(item.expiredDate), "dd MMM yyyy")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="font-bold text-sm">
                            Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                          </p>
                          {order.status === "DELIVERED" && (
                            <ReviewModalButton 
                              productId={item.productId} 
                              productName={item.product.name}
                              existingReview={existingReview}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between border-t pt-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Shipping Details</h4>
                    <p className="text-sm">{order.shippingAddress}</p>
                    <p className="text-sm">{order.phone}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-medium text-sm text-muted-foreground">Total</h4>
                    <p className="font-bold text-lg text-primary">Rp {Number(order.total).toLocaleString("id-ID")}</p>
                  </div>
                </div>
                {order.status === "UNPAID" && order.paymentMethod === "TRANSFER_BANK" && (
                  <div className="mt-4">
                    <hr />
                    <NomorRekeningList />
                    <UploadProofButton orderId={order.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
