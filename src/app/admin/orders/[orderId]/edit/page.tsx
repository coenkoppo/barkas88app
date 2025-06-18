
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { mockProducts, mockOrders } from '@/lib/mock-data';
import type { Product as ProductType, Order as OrderType } from '@/types';
import { PaymentMethod, OrderStatus } from '@/types';
import { Save, Trash2, DollarSign, Percent, Truck, Loader2, ArrowLeft, Printer, CreditCard } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { updateAdminOrder } from '@/lib/actions';

const orderItemSchema = z.object({
  productId: z.string().min(1, "Produk harus diisi."),
  quantity: z.number().min(1, "Jumlah minimal 1."),
  unitPrice: z.number().min(0, "Harga harus non-negatif."),
  productName: z.string().optional(),
});

const adminEditOrderFormSchema = z.object({
  customerName: z.string().min(2, "Nama pelanggan harus diisi."),
  customerPhone: z.string().min(10, "Nomor telepon valid harus diisi."),
  customerAddress: z.string().min(5, "Alamat harus diisi."),
  items: z.array(orderItemSchema).min(1, "Pesanan minimal memiliki satu item."),
  paymentMethod: z.nativeEnum(PaymentMethod),
  orderStatus: z.nativeEnum(OrderStatus),
  shippingFee: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  amountActuallyPaid: z.number().min(0).optional().default(0), // Jumlah yang telah dibayar
  notes: z.string().optional(),
});

type AdminEditOrderFormValues = z.infer<typeof adminEditOrderFormSchema>;

export default function AdminEditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [availableProducts, setAvailableProducts] = useState<ProductType[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdminEditOrderFormValues>({
    resolver: zodResolver(adminEditOrderFormSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      items: [],
      paymentMethod: undefined, 
      orderStatus: undefined, 
      shippingFee: 0,
      discountAmount: 0,
      amountActuallyPaid: 0,
      notes: '',
    },
  });
  
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    setAvailableProducts(mockProducts); // In a real app, fetch if not already available
    const foundOrder = mockOrders.find(o => o.id === orderId);
    if (foundOrder) {
      setCurrentOrder(foundOrder);
      form.reset({
        customerName: foundOrder.customerInfo.name,
        customerPhone: foundOrder.customerInfo.phoneNumber,
        customerAddress: foundOrder.customerInfo.address,
        items: foundOrder.items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          productName: item.name,
        })),
        paymentMethod: foundOrder.paymentMethod,
        orderStatus: foundOrder.status,
        shippingFee: foundOrder.shippingFee,
        discountAmount: foundOrder.discountAmount,
        amountActuallyPaid: foundOrder.amountActuallyPaid || 0,
        notes: foundOrder.notes || '',
      });
    } else {
      toast({ title: 'Error', description: `Pesanan dengan ID ${orderId} tidak ditemukan.`, variant: 'destructive' });
      router.push('/admin/orders');
    }
    setIsLoading(false);
  }, [orderId, form, router]);

  const watchedItems = form.watch("items") || [];
  const watchedShippingFee = form.watch("shippingFee") || 0;
  const watchedDiscountAmount = form.watch("discountAmount") || 0;
  const watchedAmountActuallyPaid = form.watch("amountActuallyPaid") || 0;
  const watchedPaymentMethod = form.watch("paymentMethod");
  const watchedOrderStatus = form.watch("orderStatus");

  const subtotal = watchedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity || 0), 0);
  const totalAmount = subtotal + watchedShippingFee - watchedDiscountAmount;
  const remainingAmount = totalAmount - watchedAmountActuallyPaid;

  const handleProductChange = (index: number, productId: string) => {
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      update(index, {
        ...(watchedItems?.[index] || { productId: '', quantity: 1, unitPrice: 0 }), 
        productId: product.id,
        unitPrice: product.price,
        productName: product.name,
        quantity: watchedItems?.[index]?.quantity || 1, 
      });
    }
  };

  const handlePrintInvoice = () => {
    toast({
        title: 'Cetak Faktur',
        description: 'Fungsi cetak akan segera hadir!',
    });
  };

  const onSubmit: SubmitHandler<AdminEditOrderFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        amountActuallyPaid: data.amountActuallyPaid || 0,
        subtotal: watchedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity || 0), 0),
        totalAmount: watchedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity || 0), 0) + data.shippingFee - data.discountAmount,
      };
      const result = await updateAdminOrder(orderId, payload);

      if (result.success) {
        toast({
          title: 'Pesanan Berhasil Diperbarui!',
          description: `Pesanan ${result.orderId} telah diperbarui.`,
        });
        router.push('/admin/orders');
      } else {
         throw new Error(result.error || 'Gagal memperbarui pesanan.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Pembaruan Pesanan Gagal',
        description: `Terjadi masalah saat memperbarui pesanan: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (isLoading || !currentOrder) {
    return <AdminLayout><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Memuat pesanan...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Button variant="outline" size="sm" asChild className="mb-2">
                  <Link href="/admin/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Pesanan</Link>
              </Button>
              <h1 className="font-headline text-3xl font-bold text-primary">Edit Pesanan #{currentOrder.id}</h1>
              <p className="text-muted-foreground">Ubah detail pesanan, harga, dan status.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" size="lg" onClick={handlePrintInvoice}>
                <Printer className="mr-2 h-5 w-5" />
                Cetak Faktur
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                Perbarui Pesanan
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader><CardTitle className="font-headline text-xl">Informasi Pelanggan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="customerName" render={({ field }) => (
                    <FormItem><FormLabel>Nama</FormLabel><FormControl><Input placeholder="Nama Pelanggan" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="customerPhone" render={({ field }) => (
                    <FormItem><FormLabel>Telepon</FormLabel><FormControl><Input type="tel" placeholder="Telepon Pelanggan" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="customerAddress" render={({ field }) => (
                    <FormItem><FormLabel>Alamat</FormLabel><FormControl><Textarea placeholder="Alamat Pelanggan" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader><CardTitle className="font-headline text-xl">Item Pesanan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end p-3 border rounded-md relative">
                      <FormField control={form.control} name={`items.${index}.productId`} render={({ field: formField }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Produk</FormLabel>}
                          <Select onValueChange={(value) => {formField.onChange(value); handleProductChange(index, value)}} value={formField.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Pilih Produk" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {availableProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                       <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: formField }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Jml</FormLabel>}
                          <FormControl><Input type="number" placeholder="1" {...formField} onChange={e => formField.onChange(parseInt(e.target.value) || 0)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                       <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field: formField }) => (
                        <FormItem>
                           {index === 0 && <FormLabel>Harga Satuan</FormLabel>}
                           <FormControl><Input type="number" placeholder="Harga" {...formField} onChange={e => formField.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                           <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" className="text-destructive self-center mt-1 sm:mt-0" onClick={() => remove(index)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                   <Button type="button" variant="outline" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, productName: '' })}>
                    <Save className="mr-2 h-4 w-4" /> Tambah Item
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-lg">
                <CardHeader><CardTitle className="font-headline text-xl">Pembayaran & Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                    <FormItem><FormLabel>Metode Pembayaran</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih metode" /></SelectTrigger></FormControl>
                        <SelectContent>{Object.values(PaymentMethod).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="orderStatus" render={({ field }) => (
                    <FormItem><FormLabel>Status Pesanan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                        <SelectContent>{Object.values(OrderStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select><FormMessage /></FormItem>
                  )} />
                  {(watchedPaymentMethod === PaymentMethod.DP) && (
                    <FormField control={form.control} name="amountActuallyPaid" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Jumlah Telah Dibayar (DP)</FormLabel>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl><Input type="number" placeholder="0" {...field} className="pl-9" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )} />
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader><CardTitle className="font-headline text-xl">Penyesuaian Harga</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="shippingFee" render={({ field }) => (
                    <FormItem><FormLabel>Biaya Pengiriman</FormLabel>
                      <div className="relative"><Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><FormControl><Input type="number" placeholder="0" {...field} className="pl-9" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl></div><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="discountAmount" render={({ field }) => (
                    <FormItem><FormLabel>Jumlah Diskon</FormLabel>
                       <div className="relative"><Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><FormControl><Input type="number" placeholder="0" {...field} className="pl-9" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl></div><FormMessage /></FormItem>
                  )} />
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal:</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Pengiriman:</span><span>{formatPrice(watchedShippingFee)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Diskon:</span><span className="text-red-600">-{formatPrice(watchedDiscountAmount)}</span></div>
                    <div className="flex justify-between font-bold text-lg text-foreground"><span>Total Pesanan:</span><span>{formatPrice(totalAmount)}</span></div>
                     {(watchedPaymentMethod === PaymentMethod.DP && (watchedOrderStatus === OrderStatus.DPPaid || watchedOrderStatus === OrderStatus.Processing || watchedOrderStatus === OrderStatus.Shipped || watchedOrderStatus === OrderStatus.Delivered )) && (
                        <>
                        <div className="flex justify-between text-muted-foreground"><span>Telah Dibayar (DP):</span><span>{formatPrice(watchedAmountActuallyPaid)}</span></div>
                        <div className="flex justify-between font-bold text-lg text-primary"><span>Sisa Pembayaran:</span><span>{formatPrice(Math.max(0, remainingAmount))}</span></div>
                        </>
                    )}
                     {(watchedPaymentMethod !== PaymentMethod.DP && watchedOrderStatus !== OrderStatus.Paid && watchedOrderStatus !== OrderStatus.Delivered && watchedOrderStatus !== OrderStatus.Cancelled && watchedOrderStatus !== OrderStatus.Refunded) && (
                        <div className="flex justify-between font-bold text-lg text-destructive"><span>Belum Lunas:</span><span>{formatPrice(totalAmount)}</span></div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardHeader><CardTitle className="font-headline text-xl">Catatan</CardTitle></CardHeader>
                <CardContent>
                     <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem><FormControl><Textarea placeholder="Perbarui catatan internal atau permintaan pelanggan..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
