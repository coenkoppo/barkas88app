
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PaymentMethod, type CartItem } from '@/types';
import { useCart } from '@/context/CartProvider';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/actions'; // Server action
import { useState } from 'react';
import { Loader2 } from 'lucide-react';


const orderFormSchema = z.object({
  name: z.string().min(2, { message: 'Nama minimal 2 karakter.' }),
  phoneNumber: z.string().min(10, { message: 'Nomor telepon minimal 10 digit.' }).regex(/^\+?[0-9\s-()]+$/, { message: 'Format nomor telepon tidak valid.' }),
  address: z.string().min(10, { message: 'Alamat minimal 10 karakter.' }),
  paymentMethod: z.nativeEnum(PaymentMethod, { errorMap: () => ({ message: 'Silakan pilih metode pembayaran.' })}),
  voucherCode: z.string().optional(),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

export function OrderForm() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      address: '',
      paymentMethod: undefined,
      voucherCode: '',
      notes: '',
    },
  });

  const onSubmit: SubmitHandler<OrderFormValues> = async (data) => {
    if (cartItems.length === 0) {
      toast({
        title: 'Keranjang Anda kosong!',
        description: 'Silakan tambahkan item ke keranjang sebelum membuat pesanan.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customerInfo: {
          name: data.name,
          phoneNumber: data.phoneNumber,
          address: data.address,
        },
        items: cartItems,
        paymentMethod: data.paymentMethod,
        voucherCode: data.voucherCode,
        notes: data.notes,
      };
      
      const result = await createOrder(orderData);

      if (result.success && result.orderId) {
        toast({
          title: 'Pesanan Berhasil Dibuat!',
          description: `ID Pesanan Anda ${result.orderId}. Kami akan segera menghubungi Anda.`,
        });
        clearCart();
        router.push(`/order-confirmation/${result.orderId}`);
      } else {
        throw new Error(result.error || 'Gagal membuat pesanan.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Pesanan Gagal',
        description: `Terjadi masalah saat membuat pesanan Anda: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama lengkap Anda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon (WhatsApp diutamakan)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="cth., 081234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat Lengkap (Jalan, Kota, Kode Pos)</FormLabel>
              <FormControl>
                <Textarea placeholder="Masukkan alamat pengiriman lengkap Anda" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Metode Pembayaran</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  {Object.values(PaymentMethod).map((method) => (
                    <FormItem key={method} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={method} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {method === PaymentMethod.DP ? 'Uang Muka (DP)' : method}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="voucherCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Voucher/Kupon (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan kode voucher" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan Pesanan (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ada instruksi khusus untuk pesanan Anda?" {...field} rows={3}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full text-lg py-3" disabled={isSubmitting || cartItems.length === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memproses Pesanan...
            </>
          ) : (
            'Buat Pesanan'
          )}
        </Button>
      </form>
    </Form>
  );
}
