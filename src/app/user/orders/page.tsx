import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import UploadProofButton from "./UploadProofButton";
import NomorRekeningList from "./NomorRekeningList";

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
                <div className="flex justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Shipping Details</h4>
                    <p className="text-sm">{order.shippingAddress}</p>
                    <p className="text-sm">{order.phone}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-medium text-sm text-muted-foreground">Total</h4>
                    <p className="font-bold">Rp {Number(order.total).toLocaleString("id-ID")}</p>
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
