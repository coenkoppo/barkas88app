
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Trash2, MoreHorizontal, PackageSearch, Loader2, ImageOff } from 'lucide-react';
import type { Product } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { getAdminProducts } from '@/lib/actions';
import { toast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const fetchedProducts = await getAdminProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Gagal memuat produk:", error);
        toast({ title: 'Gagal Memuat Produk', description: 'Tidak dapat mengambil daftar produk.', variant: 'destructive' });
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.name.localeCompare(b.name));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleDeleteProduct = (productId: string) => {
    toast({
      title: `Hapus Produk (Simulasi)`,
      description: `Produk ${productId} akan dihapus. Fitur segera hadir.`,
      variant: 'destructive'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold text-primary">Kelola Produk</h1>
            <p className="text-muted-foreground">Lihat, tambah, edit, dan kelola katalog produk Anda.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/products/new">
              <PlusCircle className="mr-2 h-5 w-5" /> Tambah Produk Baru
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="font-headline text-xl">Daftar Produk</CardTitle>
                <div className="relative w-full sm:w-64">
                    <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari berdasarkan ID, Nama, Kategori..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="text-center py-8">
                    <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-2" />
                    <p className="text-muted-foreground">Memuat produk...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                    <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">{searchTerm ? "Tidak ada produk yang cocok dengan pencarian Anda." : "Belum ada produk. Tambahkan satu!"}</p>
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Gambar</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-md overflow-hidden border bg-muted">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint={`${product.category} item`}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <ImageOff className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                        <div>{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.id}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                    <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                    <TableCell className="text-center">{product.stock}</TableCell>
                    <TableCell className="text-center">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${product.id}/edit`} className="cursor-pointer">
                              <Edit3 className="mr-2 h-4 w-4" /> Edit Produk
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive-foreground focus:bg-destructive cursor-pointer"
                            onClick={() => handleDeleteProduct(product.id)}
                           >
                            <span className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" /> Hapus Produk
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
