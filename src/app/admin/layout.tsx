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
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <nav className="flex items-center justify-center gap-2 h-16 overflow-x-auto no-scrollbar">
            <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors whitespace-nowrap text-sm font-medium">
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/products" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors whitespace-nowrap text-sm font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Products</span>
            </Link>
            <Link href="/admin/categories" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors whitespace-nowrap text-sm font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Categories</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors whitespace-nowrap text-sm font-medium">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span>Orders</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors whitespace-nowrap text-sm font-medium">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Users</span>
            </Link>
            <Link href="/admin/bank-accounts" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors whitespace-nowrap text-sm font-medium">
              <Landmark className="h-4 w-4 text-muted-foreground" />
              <span>Rekening Bank</span>
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors whitespace-nowrap text-sm font-medium">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Company Info</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full bg-muted/10">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
