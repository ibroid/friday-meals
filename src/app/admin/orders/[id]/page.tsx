import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, Package, CalendarIcon, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import OrderStatusUpdater from "./OrderStatusUpdater";
import ExpeditionSection from "./ExpeditionSection";
import Link from "next/link";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true },
      },
      orderItems: {
        include: { product: true },
      },
      expedition: true,
    },
  });

  if (!order) {
    notFound();
  }

  const afterSales = await prisma.afterSale.findMany({
    where: {
      userId: order.userId,
      productId: {
        in: order.orderItems.map((item) => item.productId),
      },
    },
  });

  const formattedOrder = {
    ...order,
    total: Number(order.total),
    orderItems: order.orderItems.map((item) => ({
      ...item,
      price: Number(item.price),
      afterSale: afterSales.find((as) => as.productId === item.productId),
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
    })),
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-3xl font-bold">Order Details - #{order.id.slice(-6).toUpperCase()}</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="space-y-8">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Customer</p>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="font-semibold text-lg">{formattedOrder.user.name}</p>
                <p className="text-muted-foreground">{formattedOrder.user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact & Info</p>
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{formattedOrder.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span>{format(new Date(formattedOrder.createdAt), "dd MMM yyyy, HH:mm")}</span>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    {formattedOrder.paymentMethod === "TRANSFER_BANK" ? "Transfer Bank" : "QRIS"}
                  </span>
                  <div className="ml-2 inline-block">
                    <OrderStatusUpdater orderId={formattedOrder.id} currentStatus={formattedOrder.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          {formattedOrder.paymentProofUrl && (
            <div className="space-y-3 border-t pt-6">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Bukti Pembayaran</p>
              <a href={formattedOrder.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block w-48 h-64 relative rounded-xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors shadow-sm">
                <Image src={formattedOrder.paymentProofUrl} alt="Bukti Pembayaran" fill sizes="192px" className="object-cover" />
              </a>
            </div>
          )}

          {/* Address & Map */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Delivery Address</p>
                <p className="mt-2 bg-muted/30 p-4 rounded-lg">{formattedOrder.shippingAddress}</p>
              </div>
            </div>
            {formattedOrder.latitude && formattedOrder.longitude && (
              <div className="mt-4 h-[300px] w-full rounded-xl overflow-hidden border shadow-sm">
                <iframe
                  src={`https://maps.google.com/maps?q=${formattedOrder.latitude},${formattedOrder.longitude}&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                ></iframe>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-4 border-t pt-6">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Package className="h-4 w-4" /> Ordered Items
            </p>
            <div className="space-y-3">
              {formattedOrder.orderItems.map((item: any) => (
                <div key={item.id} className="flex flex-col bg-muted/30 p-4 rounded-xl border border-transparent hover:border-border transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {item.product.imageUrl ? (
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden border">
                          <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="64px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border">
                          <Package className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-base">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Rp {Number(item.price).toLocaleString("id-ID")} x {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-base">
                      Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                  
                  {item.afterSale && (
                    <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-900 dark:text-blue-200">Customer Feedback</span>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < item.afterSale.rating ? "fill-current" : "text-gray-300 dark:text-gray-600"}`} />
                          ))}
                        </div>
                      </div>
                      {item.afterSale.review && (
                        <p className="text-muted-foreground dark:text-gray-300"><span className="font-medium text-foreground">Review:</span> {item.afterSale.review}</p>
                      )}
                      {item.afterSale.complaint && (
                        <p className="text-red-600/90 dark:text-red-400"><span className="font-medium">Complaint:</span> {item.afterSale.complaint}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="flex justify-between items-center border-t pt-6">
            <span className="font-semibold text-xl text-muted-foreground">Total Payment</span>
            <span className="font-black text-2xl text-primary">
              Rp {formattedOrder.total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
        </div>

        {/* Expedition Tracking Section */}
        <ExpeditionSection order={formattedOrder} initialExpedition={formattedOrder.expedition} />
      </div>
    </div>
  );
}
