
'use client';

import Image from 'next/image';
import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderForm } from '@/components/OrderForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { StoreLayout } from '@/components/StoreLayout';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-headline text-3xl font-bold text-primary mb-8 text-center">Keranjang Belanja Anda</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="font-headline text-2xl font-semibold text-foreground mb-3">Keranjang Anda kosong.</h2>
            <p className="text-muted-foreground mb-6">Sepertinya Anda belum menambahkan apa pun ke keranjang.</p>
            <Button asChild size="lg">
              <Link href="/">Lanjut Belanja</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Item Keranjang ({getItemCount()})</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center py-4 gap-4">
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-md overflow-hidden border">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={`${item.category} item`}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-md text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                      <div className="flex items-center mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Kurangi jumlah ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          className="h-8 w-12 text-center mx-2"
                          min="1"
                          aria-label={`Jumlah ${item.name}`}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Tambah jumlah ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-md text-foreground">{formatPrice(item.price * item.quantity)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive mt-1"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Hapus ${item.name} dari keranjang`}
                      >
                        <Trash2 className="h-4 w-4 mr-1 sm:mr-0" /> <span className="hidden sm:inline">Hapus</span>
                      </Button>
                    </div>
                  </div>
                ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-lg sticky top-20"> {/* Sticky summary */}
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-md">
                    <span>Subtotal ({getItemCount()} item)</span>
                    <span className="font-semibold">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-md text-muted-foreground">
                    <span>Pengiriman</span>
                    <span>Dihitung saat checkout</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Estimasi Total</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Detail Checkout</CardTitle>
                  <CardDescription>Silakan isi informasi Anda untuk menyelesaikan pesanan.</CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderForm />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
