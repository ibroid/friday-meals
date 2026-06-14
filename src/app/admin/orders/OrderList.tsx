"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Eye, MapPin, Phone, Package, Calendar as CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type OrderWithRelations = any; // Will match the nested Prisma types from the server

export default function OrderList({ initialOrders }: { initialOrders: OrderWithRelations[] }) {
  const [orders, setOrders] = useState<OrderWithRelations[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterPayment, setFilterPayment] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const filteredOrders = orders.filter((o) => {
    const matchesPayment = filterPayment === "ALL" || o.paymentMethod === filterPayment;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery 
      || o.id.toLowerCase().includes(searchLower)
      || o.user.name?.toLowerCase().includes(searchLower)
      || o.user.email?.toLowerCase().includes(searchLower)
      || o.phone?.toLowerCase().includes(searchLower);

    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(o.createdAt).setHours(0, 0, 0, 0);
      if (startDate) {
        matchesDate = matchesDate && orderDate >= new Date(startDate).setHours(0, 0, 0, 0);
      }
      if (endDate) {
        matchesDate = matchesDate && orderDate <= new Date(endDate).setHours(23, 59, 59, 999);
      }
    }
    
    return matchesPayment && matchesSearch && matchesDate;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(orders.map((o) => (o.id === orderId ? data.order : o)));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-card p-4 rounded-lg border gap-4">
        <h2 className="font-semibold whitespace-nowrap">Filter Orders</h2>
        <div className="flex flex-col lg:flex-row gap-3 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative w-full lg:w-[250px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Search ID, Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Popover>
              <PopoverTrigger
                className={cn("inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 border bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full lg:w-[150px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Start Date</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">-</span>
            <Popover>
              <PopoverTrigger
                className={cn("inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 border bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full lg:w-[150px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>End Date</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Filter */}
          <Select value={filterPayment} onValueChange={(val) => setFilterPayment(val || "ALL")}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Semua Pembayaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Pembayaran</SelectItem>
              <SelectItem value="TRANSFER_BANK">Transfer Bank</SelectItem>
              <SelectItem value="QRIS">QRIS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.slice(-6).toUpperCase()}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.user.name}</span>
                    <span className="text-xs text-muted-foreground">{order.user.email}</span>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                    {order.paymentMethod === "TRANSFER_BANK" ? "Transfer Bank" : "QRIS"}
                  </span>
                </TableCell>
                <TableCell>Rp {Number(order.total).toLocaleString("id-ID")}</TableCell>
                <TableCell>
                  <Select 
                    value={order.status} 
                    onValueChange={(val) => { if (val) handleStatusChange(order.id, val) }}
                    disabled={updatingId === order.id}
                  >
                    <SelectTrigger className={`w-[140px] h-8 text-xs font-semibold ${
                      order.status === "UNPAID" ? "text-gray-600 bg-gray-100" :
                      order.status === "PENDING" ? "text-yellow-600 bg-yellow-50" :
                      order.status === "PROCESSING" ? "text-blue-600 bg-blue-50" :
                      order.status === "SHIPPED" ? "text-purple-600 bg-purple-50" :
                      order.status === "DELIVERED" ? "text-green-600 bg-green-50" :
                      "text-red-600 bg-red-50"
                    }`}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNPAID">UNPAID</SelectItem>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                      <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                      <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Order Details - #{order.id.slice(-6).toUpperCase()}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 mt-4">
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Customer</p>
                            <p className="font-medium">{order.user.name}</p>
                            <p className="text-sm">{order.user.email}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Contact</p>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{order.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}</span>
                            </div>
                            <div className="mt-2 inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                              {order.paymentMethod === "TRANSFER_BANK" ? "Transfer Bank" : "QRIS"}
                            </div>
                          </div>
                        </div>

                        {/* Payment Proof */}
                        {order.paymentProofUrl && (
                          <div className="space-y-2 border-t pt-4">
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              Bukti Pembayaran
                            </p>
                            <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block w-48 h-64 relative rounded-md overflow-hidden border hover:opacity-90 transition-opacity">
                              <Image src={order.paymentProofUrl} alt="Bukti Pembayaran" fill sizes="192px" className="object-cover" />
                            </a>
                          </div>
                        )}

                        {/* Address & Map */}
                        <div className="space-y-2 border-t pt-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Delivery Address</p>
                              <p className="text-sm mt-1">{order.shippingAddress}</p>
                            </div>
                          </div>
                          {order.latitude && order.longitude && (
                            <div className="mt-3 h-[200px] w-full rounded-md overflow-hidden border">
                              <iframe
                                src={`https://maps.google.com/maps?q=${order.latitude},${order.longitude}&z=15&output=embed`}
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
                        <div className="space-y-3 border-t pt-4">
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" /> Ordered Items
                          </p>
                          <div className="space-y-3">
                            {order.orderItems.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {item.product.imageUrl && (
                                    <div className="w-12 h-12 relative rounded overflow-hidden">
                                      <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="48px" className="object-cover" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-sm">{item.product.name}</p>
                                    <p className="text-xs text-muted-foreground">Rp {Number(item.price).toLocaleString("id-ID")} x {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="font-semibold text-sm">
                                  Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total Summary */}
                        <div className="flex justify-between items-center border-t pt-4">
                          <span className="font-semibold text-lg">Total Payment</span>
                          <span className="font-bold text-xl text-primary">
                            Rp {Number(order.total).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    </div>
  );
}
