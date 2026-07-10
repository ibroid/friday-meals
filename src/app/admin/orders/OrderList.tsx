"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Eye, MapPin, Phone, Package, Calendar as CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type OrderWithRelations = any; // Will match the nested Prisma types from the server

export default function OrderList({ initialOrders }: { initialOrders: OrderWithRelations[] }) {
  const [orders, setOrders] = useState<OrderWithRelations[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterPayment, setFilterPayment] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
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
                  onSelect={(d) => {
                    setStartDate(d);
                    setCurrentPage(1);
                  }}
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
                  onSelect={(d) => {
                    setEndDate(d);
                    setCurrentPage(1);
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Filter */}
          <Select value={filterPayment} onValueChange={(val) => {
            setFilterPayment(val || "ALL");
            setCurrentPage(1);
          }}>
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
          {paginatedOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.slice(-6).toUpperCase()}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.user.name}</span>
                    <span className="text-xs text-muted-foreground">{order.user.email}</span>
                  </div>
                </TableCell>
                <TableCell suppressHydrationWarning>{format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}</TableCell>
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
                  <Link href={`/admin/orders/${order.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

    {filteredOrders.length > 0 && (
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} entries
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    )}
    </div>
  );
}
