
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { StoreLayout } from '@/components/StoreLayout';
import { mockOrders } from '@/lib/mock-data'; // Using mock for display
import type { Order } from '@/types';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // Simulate fetching order details
      // In a real app, you'd fetch this from your backend
      const foundOrder = mockOrders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrderDetails(foundOrder);
      } else {
        // If order not found in mock, create a generic one or redirect
        // For this example, let's show a generic message if not found in mock
        // but typically an API call would validate the order
        setOrderDetails({ // Minimal fallback
            id: orderId,
            customerInfo: { name: 'Pelanggan Yth.', phoneNumber: '', address: '' },
            items: [],
            subtotal: 0,
            shippingFee: 0,
            discountAmount: 0,
            totalAmount: 0,
            paymentMethod: 'COD' as any,
            status: 'Pending' as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
      }
      setIsLoading(false);
    } else {
      router.push('/'); // Redirect if no orderId
    }
  }, [orderId, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Package className="h-16 w-16 animate-pulse text-primary" />
          <p className="ml-4 text-xl text-muted-foreground">Memuat detail pesanan...</p>
        </div>
      </StoreLayout>
    );
  }
  
  if (!orderDetails) {
     return (
      <StoreLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
          <ShoppingCart className="h-20 w-20 text-destructive mb-6" />
          <h1 className="font-headline text-3xl font-bold text-destructive mb-4">Pesanan Tidak Ditemukan</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Kami tidak dapat menemukan pesanan dengan ID: {orderId}. Mungkin terjadi kesalahan atau pesanan tidak ada.
          </p>
          <Button asChild size="lg">
            <Link href="/">Kembali ke Katalog</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }


  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="text-center bg-primary/10 rounded-t-lg py-8">
            <CheckCircle className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="font-headline text-3xl text-primary">Terima Kasih Atas Pesanan Anda!</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Pesanan Anda <span className="font-semibold text-primary">{orderDetails.id}</span> telah berhasil dibuat.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-center text-foreground">
              Kami telah menerima pesanan Anda dan akan segera memprosesnya. 
              Konfirmasi (simulasi) akan dikirim melalui WhatsApp ke <span className="font-semibold">{orderDetails.customerInfo.phoneNumber}</span>.
              Tim kami akan menghubungi Anda untuk detail lebih lanjut mengenai pembayaran dan pengiriman.
            </p>

            <div className="border border-border rounded-md p-4">
              <h3 className="font-headline text-lg font-semibold mb-2 text-foreground">Ringkasan Pesanan:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {orderDetails.items.map(item => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <hr className="my-2"/>
              <div className="flex justify-between font-semibold text-foreground">
                <span>Jumlah Total:</span>
                <span>{formatPrice(orderDetails.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                 <span>Metode Pembayaran:</span>
                 <span>{orderDetails.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center">
              <Button asChild size="lg" className="mt-4">
                <Link href="/">Lanjut Belanja</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StoreLayout>
  );
}
