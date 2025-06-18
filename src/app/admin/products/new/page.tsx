
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { createProduct } from '@/lib/actions';
import { ProductCategory, ProductTag, type ProductFormValues, productFormSchema } from '@/types'; 
import { PackagePlus, ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function AdminAddNewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: undefined, 
      tags: [],
      imageUrl: '',
    },
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await createProduct(data);
      if (result.success && result.productId) {
        toast({
          title: 'Produk Berhasil Dibuat!',
          description: `Produk "${data.name}" (ID: ${result.productId}) telah ditambahkan.`,
        });
        router.push('/admin/products');
      } else {
        throw new Error(result.error || 'Gagal membuat produk.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: 'Pembuatan Produk Gagal',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <Button variant="outline" size="sm" asChild className="mb-4">
              <Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Produk</Link>
            </Button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="font-headline text-3xl font-bold text-primary">Tambah Produk Baru</h1>
                <p className="text-muted-foreground">Isi detail untuk menambahkan produk baru.</p>
              </div>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                Simpan Produk
              </Button>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Detail Produk</CardTitle>
              <CardDescription>Berikan informasi penting tentang produk baru.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Nama Produk</FormLabel>
                  <FormControl><Input placeholder="Masukkan nama produk" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl><Textarea placeholder="Deskripsikan produk" {...field} rows={4} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga (IDR)</FormLabel>
                  <FormControl><Input type="number" placeholder="cth., 150000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="stock" render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Stok</FormLabel>
                  <FormControl><Input type="number" placeholder="cth., 100" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.values(ProductCategory).map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Gambar</FormLabel>
                  <FormControl><Input placeholder="https://placehold.co/600x400.png" {...field} /></FormControl>
                  <FormDescription>Masukkan URL lengkap gambar produk. Fitur unggah sebenarnya akan segera hadir.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="tags" render={() => (
                <FormItem className="md:col-span-2">
                  <div className="mb-2">
                    <FormLabel className="text-base">Tag Produk</FormLabel>
                    <FormDescription>Pilih tag yang relevan untuk produk.</FormDescription>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Object.values(ProductTag).map((tag) => (
                      <FormField
                        key={tag}
                        control={form.control}
                        name="tags"
                        render={({ field }) => {
                          return (
                            <FormItem key={tag} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(tag)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), tag])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== tag
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">
                                {tag}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button type="submit" size="lg" disabled={isSubmitting} className="ml-auto">
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Simpan Produk
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </AdminLayout>
  );
}
