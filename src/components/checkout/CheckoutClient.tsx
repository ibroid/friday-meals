"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { Package } from "lucide-react";

// Dynamically import MapPicker with SSR disabled to prevent Leaflet errors
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(9, { message: "Phone must be at least 9 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  address: z.string().min(10, { message: "Please provide a detailed address" }),
  latitude: z.number({ message: "Please pick a location on the map" }),
  longitude: z.number({ message: "Please pick a location on the map" }),
  paymentMethod: z.enum(["TRANSFER_BANK", "QRIS"], { message: "Silakan pilih metode pembayaran" }),
});

export default function CheckoutClient() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      paymentMethod: "" as any,
    },
  });

  const handlePaymentMethodChange = (value: string | null) => {
    if (!value) return;
    form.setValue("paymentMethod", value as "TRANSFER_BANK" | "QRIS", { shouldValidate: true });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          items,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to place order");
      }

      clearCart();
      router.push("/user/orders?success=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push("/")}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Checkout Delivery</CardTitle>
            <CardDescription>
              Please provide your delivery details and pick a location on the map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="08123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Delivery Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Jl. Sudirman No. 123, RT 01/02..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Pembayaran</FormLabel>
                      <Select onValueChange={handlePaymentMethodChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Disini" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRANSFER_BANK">Transfer Bank (Konfirmasi Manual)</SelectItem>
                          <SelectItem value="QRIS">QRIS</SelectItem>
                        </SelectContent>
                      </Select>
                      {
                        // eslint-disable-next-line react-hooks/incompatible-library
                        form.watch("paymentMethod") === "QRIS" && (
                        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-md text-yellow-600 text-sm font-medium">
                          Maaf, fitur pembayaran dengan QRIS belum tersedia untuk saat ini. Silakan pilih metode Transfer Bank.
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pin Location</FormLabel>
                      <div className="h-[300px] w-full rounded-md border overflow-hidden relative z-0">
                        <MapPicker 
                          position={
                            form.watch("latitude") && form.watch("longitude")
                              ? { lat: form.watch("latitude"), lng: form.watch("longitude") }
                              : null
                          }
                          onChange={(pos) => {
                            form.setValue("latitude", pos.lat, { shouldValidate: true });
                            form.setValue("longitude", pos.lng, { shouldValidate: true });
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isLoading || form.watch("paymentMethod") === "QRIS"}>
                  {isLoading ? "Processing..." : "Place Order"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <div className="border rounded-lg p-6 sticky top-24 bg-card">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4 mb-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex gap-3">
                {item.product.imageUrl ? (
                  <div className="w-16 h-16 relative rounded overflow-hidden shrink-0">
                    <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="64px" className="object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-secondary/50 rounded flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-sm line-clamp-2">{item.product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  <p className="font-semibold text-sm mt-1">Rp {(Number(item.product.price) * item.quantity).toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">Rp {cartTotal.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
