import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Landmark } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-64 border-r bg-muted/20 hidden md:block overflow-y-auto">
        <nav className="flex flex-col gap-2 p-4">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span>Products</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <span>Orders</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span>Users</span>
          </Link>
          <Link href="/admin/bank-accounts" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors">
            <Landmark className="h-5 w-5 text-muted-foreground" />
            <span>Rekening Bank</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span>Company Info</span>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10">
        {children}
      </main>
    </div>
  );
}
