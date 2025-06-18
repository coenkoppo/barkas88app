
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { mockProducts } from '@/lib/mock-data';
import type { Product as ProductType, CustomerInfo } from '@/types';
import { PaymentMethod, OrderStatus, ProductCategory } from '@/types';
import { PlusCircle, Trash2, DollarSign, Percent, Truck, Loader2, CreditCard, Search, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { createAdminOrder, getAdminCustomers } from '@/lib/actions'; 
import { cn } from '@/lib/utils';

const orderItemSchema = z.object({
  productId: z.string().min(1, "Produk harus diisi."),
  quantity: z.number().min(1, "Jumlah minimal 1."),
  unitPrice: z.number().min(0, "Harga harus non-negatif."),
  productName: z.string().optional(),
});

const adminOrderFormSchema = z.object({
  customerName: z.string().min(2, "Nama pelanggan harus diisi."),
  customerPhone: z.string().min(10, "Nomor telepon valid harus diisi."),
  customerAddress: z.string().min(5, "Alamat harus diisi."),
  items: z.array(orderItemSchema).min(1, "Pesanan minimal memiliki satu item."),
  paymentMethod: z.nativeEnum(PaymentMethod),
  orderStatus: z.nativeEnum(OrderStatus),
  shippingFee: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  amountActuallyPaid: z.number().min(0).optional().default(0),
  notes: z.string().optional(),
});

type AdminOrderFormValues = z.infer<typeof adminOrderFormSchema>;

export default function AdminNewOrderPage() {
  const router = useRouter();
  const [availableProducts, setAvailableProducts] = useState<ProductType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allCustomers, setAllCustomers] = useState<CustomerInfo[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerInfo[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setAvailableProducts(mockProducts);
    async function fetchAllCustomers() {
      try {
        const customers = await getAdminCustomers();
        setAllCustomers(customers);
      } catch (error) {
        console.error("Gagal memuat daftar pelanggan:", error);
        toast({ title: "Gagal Memuat Pelanggan", description: "Tidak dapat mengambil daftar pelanggan untuk pencarian.", variant: "destructive" });
      }
    }
    fetchAllCustomers();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowCustomerSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const form = useForm<AdminOrderFormValues>({
    resolver: zodResolver(adminOrderFormSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0, productName: '' }],
      paymentMethod: PaymentMethod.Cash,
      orderStatus: OrderStatus.Pending,
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

  const watchedItems = form.watch("items");
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
        ...watchedItems[index],
        productId: product.id,
        unitPrice: product.price,
        productName: product.name, 
      });
    }
  };

  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCustomerSearchTerm(term);
    if (term.length > 0) {
      const filtered = allCustomers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(term.toLowerCase()) ||
          (customer.phoneNumber && customer.phoneNumber.includes(term))
      );
      setFilteredCustomers(filtered);
      setShowCustomerSuggestions(true);
    } else {
      setFilteredCustomers([]);
      setShowCustomerSuggestions(false);
    }
  };

  const handleCustomerSelect = (customer: CustomerInfo) => {
    form.setValue('customerName', customer.name);
    form.setValue('customerPhone', customer.phoneNumber || '');
    form.setValue('customerAddress', customer.address || '');
    setCustomerSearchTerm(`${customer.name} (${customer.phoneNumber})`);
    setShowCustomerSuggestions(false);
    setFilteredCustomers([]);
  };


  const onSubmit: SubmitHandler<AdminOrderFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerInfo: {
          name: data.customerName,
          phoneNumber: data.customerPhone,
          address: data.customerAddress,
        },
        items: data.items.map(item => {
            const product = availableProducts.find(p => p.id === item.productId);
            return {
                id: item.productId,
                name: product?.name || 'Produk Tidak Dikenal',
                description: product?.description || '',
                price: item.unitPrice,
                imageUrl: product?.imageUrl || '',
                category: product?.category || ProductCategory.Other,
                tags: product?.tags || [],
                stock: product?.stock || 0,
                quantity: item.quantity,
            };
        }),
        paymentMethod: data.paymentMethod,
        status: data.orderStatus,
        shippingFee: data.shippingFee,
        discountAmount: data.discountAmount,
        amountActuallyPaid: data.amountActuallyPaid || 0,
        subtotal: subtotal,
        totalAmount: totalAmount,
        notes: data.notes,
      };

      const result = await createAdminOrder(orderPayload);

      if (result.success && result.orderId) {
        toast({
          title: 'Pesanan Berhasil Dibuat!',
          description: `Pesanan admin ${result.orderId} telah dibuat.`,
        });
        router.push('/admin/orders');
      } else {
        throw new Error(result.error || 'Gagal membuat pesanan admin.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Pembuatan Pesanan Gagal',
        description: `Terjadi masalah saat membuat pesanan: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <AdminLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="font-headline text-3xl font-bold text-primary">Buat Pesanan Baru</h1>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
              Simpan Pesanan
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Informasi Pelanggan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative" ref={searchContainerRef}>
                    <FormLabel htmlFor="customerSearch">Cari Pelanggan (Nama/Telepon)</FormLabel>
                    <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="customerSearch"
                        placeholder="Ketik untuk mencari pelanggan..."
                        value={customerSearchTerm}
                        onChange={handleCustomerSearchChange}
                        onFocus={() => customerSearchTerm && filteredCustomers.length > 0 && setShowCustomerSuggestions(true)}
                        className="pl-9"
                        />
                    </div>
                    {showCustomerSuggestions && filteredCustomers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredCustomers.map((customer) => (
                            <div
                            key={customer.phoneNumber}
                            className="p-3 hover:bg-accent cursor-pointer flex items-center justify-between"
                            onClick={() => handleCustomerSelect(customer)}
                            >
                            <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-sm text-muted-foreground">{customer.phoneNumber}</p>
                            </div>
                            <UserCheck className="h-5 w-5 text-primary"/>
                            </div>
                        ))}
                        </div>
                    )}
                  </div>

                  <FormField control={form.control} name="customerName" render={({ field }) => (
                    <FormItem><FormLabel>Nama</FormLabel><FormControl><Input placeholder="Nama Pelanggan" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="customerPhone" render={({ field }) => (
                      <FormItem><FormLabel>Telepon</FormLabel><FormControl><Input type="tel" placeholder="Telepon Pelanggan" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="customerAddress" render={({ field }) => (
                    <FormItem><FormLabel>Alamat</FormLabel><FormControl><Textarea placeholder="Alamat Pelanggan" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Item Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end p-3 border rounded-md relative">
                      <FormField control={form.control} name={`items.${index}.productId`} render={({ field: formField }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Produk</FormLabel>}
                          <Select onValueChange={(value) => {formField.onChange(value); handleProductChange(index, value)}} defaultValue={formField.value}>
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
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="text-destructive self-center mt-1 sm:mt-0" onClick={() => remove(index)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, productName: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Item
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Pembayaran & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Pembayaran</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih metode" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {Object.values(PaymentMethod).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="orderStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Pesanan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                        <SelectContent>
                           {Object.values(OrderStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                       <FormMessage />
                    </FormItem>
                  )} />
                  {(form.watch("paymentMethod") === PaymentMethod.DP || form.watch("orderStatus") === OrderStatus.DPPaid) && (
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
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Rincian Harga</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="shippingFee" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Pengiriman</FormLabel>
                      <div className="relative">
                        <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl><Input type="number" placeholder="0" {...field} className="pl-9" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="discountAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Diskon</FormLabel>
                       <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl><Input type="number" placeholder="0" {...field} className="pl-9" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
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
                        <FormItem><FormControl><Textarea placeholder="Tambahkan catatan internal atau permintaan pelanggan..." {...field} /></FormControl><FormMessage /></FormItem>
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


    