
'use client';

import Link from 'next/link';
import { ShoppingCart, UserCircle, LayoutDashboard, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartProvider';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export function Header() {
  const { getItemCount } = useCart();
  const [itemCount, setItemCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setItemCount(getItemCount());
    }
  }, [getItemCount, isMounted, useCart().cartItems]); // re-run when cartItems changes

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Bali88 Digital Sales Home">
          <PackageSearch className="h-7 w-7 text-primary" />
          <span className="font-headline text-xl font-semibold text-primary">Bali88 Digital Sales</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Katalog
            </Link>
          </Button>
          <Button variant="ghost" asChild className="relative">
            <Link href="/cart" className="text-sm font-medium text-foreground hover:text-primary transition-colors" aria-label={`Lihat Keranjang, ${itemCount} item`}>
              <ShoppingCart className="h-5 w-5" />
              <span className="ml-1 hidden sm:inline">Keranjang</span>
              {isMounted && itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {itemCount}
                </Badge>
              )}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard" className="text-sm font-medium">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </Button>
          {/* Placeholder for user authentication */}
          {/* <Button variant="ghost" size="icon" aria-label="User Account">
            <UserCircle className="h-6 w-6" />
          </Button> */}
        </nav>
      </div>
    </header>
  );
}
