
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { upsellProductBundles, type UpsellProductBundlesInput, type UpsellProductBundlesOutput } from '@/ai/flows/upsell-product-bundles';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const upsellingSchema = z.object({
  orderHistory: z.string().min(10, { message: 'Riwayat pesanan minimal 10 karakter.' }).max(5000),
  currentCart: z.string().min(5, { message: 'Detail keranjang saat ini minimal 5 karakter.' }).max(2000),
});

type UpsellingFormValues = z.infer<typeof upsellingSchema>;

export function UpsellingTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upsellingResult, setUpsellingResult] = useState<UpsellProductBundlesOutput | null>(null);

  const form = useForm<UpsellingFormValues>({
    resolver: zodResolver(upsellingSchema),
    defaultValues: {
      orderHistory: '',
      currentCart: '',
    },
  });

  const onSubmit: SubmitHandler<UpsellingFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setUpsellingResult(null);

    try {
      const result = await upsellProductBundles(data as UpsellProductBundlesInput);
      setUpsellingResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.';
      setError(`Gagal mendapatkan saran upselling: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <CardTitle className="font-headline text-2xl text-primary">Asisten Upselling AI</CardTitle>
        </div>
        <CardDescription>
          Analisis pola pesanan pelanggan untuk menyarankan bundel produk dan diskon personal.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="orderHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Riwayat Pesanan Pelanggan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="cth., Produk A (2 unit, 2023-10-15), Produk B (1 unit, 2023-11-01)..."
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Berikan ringkasan pembelian pelanggan sebelumnya. Sertakan nama produk, jumlah, dan tanggal jika memungkinkan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentCart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Item Keranjang Saat Ini</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="cth., Produk C (1 unit), Produk D (3 unit)..."
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Daftar item yang saat ini ada di keranjang belanja pelanggan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoading} className="w-full py-3 text-lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Dapatkan Saran Upselling
                </>
              )}
            </Button>
            {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Kesalahan</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
          </CardFooter>
        </form>
      </Form>

      {upsellingResult && (
        <CardContent className="mt-6 border-t pt-6">
          <h3 className="font-headline text-xl font-semibold mb-4 text-primary">Saran yang Dihasilkan:</h3>
          <div className="space-y-4">
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Saran Bundel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{upsellingResult.suggestedBundles}</p>
              </CardContent>
            </Card>
            <Card className="bg-accent/10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-accent-foreground">Penawaran Diskon Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{upsellingResult.discountOffer}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
