"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select 
      value={currentStatus} 
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className={`w-[140px] h-8 text-xs font-semibold ${
        currentStatus === "UNPAID" ? "text-gray-600 bg-gray-100" :
        currentStatus === "PENDING" ? "text-yellow-600 bg-yellow-50" :
        currentStatus === "PROCESSING" ? "text-blue-600 bg-blue-50" :
        currentStatus === "SHIPPED" ? "text-purple-600 bg-purple-50" :
        currentStatus === "DELIVERED" ? "text-green-600 bg-green-50" :
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
  );
}
