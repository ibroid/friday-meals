"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User as UserIcon, LogOut, Settings, Package, Users, Trash2, Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { data: session } = useSession();
  const { cart, itemCount, cartTotal, removeFromCart, clearCart } = useCart();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="container flex h-16 items-center mx-auto px-4 max-w-5xl">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="FridayMeals Logo" width={36} height={36} className="object-contain" priority />
          <span className="font-bold text-xl text-primary hidden sm:inline-block">FridayMeals</span>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex ml-6 space-x-4">
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            About Us
          </Link>
        </div>

        {/* Mobile Links */}
        <div className="flex md:hidden ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
              <Menu className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem render={
                <Link href="/about" className="cursor-pointer flex w-full">About Us</Link>
              } />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1" />

        <div className="flex items-center space-x-4">
          {session?.user.role !== "ADMIN" && (
            <Dialog>
              <DialogTrigger render={
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {itemCount}
                    </span>
                  )}
                </Button>
              } />
              <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Your Cart</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Your cart is empty
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                        <div className="flex gap-3 items-center overflow-hidden">
                          {item.product.imageUrl ? (
                            <div className="w-12 h-12 relative rounded overflow-hidden shrink-0">
                              <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="48px" className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-secondary/50 rounded flex items-center justify-center shrink-0">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Rp {Number(item.product.price).toLocaleString("id-ID")} x {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4 shrink-0">
                          <p className="font-bold text-sm">
                            Rp {(Number(item.product.price) * item.quantity).toLocaleString("id-ID")}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg text-primary">
                        Rp {cartTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <Link href="/checkout" className={cn(buttonVariants({ variant: "default" }), "w-full")}>
                      Proceed to Checkout
                    </Link>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                
                {session.user.role === "ADMIN" ? (
                  <>
                    <DropdownMenuItem
                      render={
                        <Link href="/admin" className="cursor-pointer flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      }
                    />
                    <DropdownMenuItem
                      render={
                        <Link href="/admin/products" className="cursor-pointer flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Products</span>
                        </Link>
                      }
                    />
                    <DropdownMenuItem
                      render={
                        <Link href="/admin/orders" className="cursor-pointer flex items-center">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          <span>Orders</span>
                        </Link>
                      }
                    />
                    <DropdownMenuItem
                      render={
                        <Link href="/admin/users" className="cursor-pointer flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          <span>Users</span>
                        </Link>
                      }
                    />
                  </>
                ) : (
                  <DropdownMenuItem
                    render={
                      <Link href="/user/orders" className="cursor-pointer flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                      </Link>
                    }
                  />
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  clearCart();
                  signOut();
                }} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="space-x-2">
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
