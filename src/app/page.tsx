'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { getAllProducts, initializeDefaultData } from '@/lib/firestore';
import type { Product } from '@/types';
import { ProductCategory, ProductTag } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, XCircle, ShoppingBag } from 'lucide-react';
import { StoreLayout } from '@/components/StoreLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        // Inisialisasi data default jika belum ada
        await initializeDefaultData();
        
        // Ambil semua produk dari Firestore
        const fetchedProducts = await getAllProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((product) =>
        selectedCategory === 'all' ? true : product.category === selectedCategory
      )
      .filter((product) =>
        selectedTag === 'all' ? true : product.tags.includes(selectedTag as ProductTag)
      );
  }, [searchTerm, selectedCategory, selectedTag, products]);

  const categories = useMemo(() => ['all', ...Object.values(ProductCategory)], []);
  const tags = useMemo(() => ['all', ...Object.values(ProductTag)], []);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTag('all');
  };

  return (
    <StoreLayout>
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold text-primary mb-2">Selamat Datang di Katalog Kami</h1>
        <p className="text-lg text-muted-foreground">Temukan produk unik dari Bali.</p>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">Cari Produk</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="cth., Kemeja Batik, Kursi Rotan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-foreground mb-1">Kategori</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-filter" className="w-full">
                  <SelectValue placeholder="Filter berdasarkan kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'Semua Kategori' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="tag-filter" className="block text-sm font-medium text-foreground mb-1">Tag</label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger id="tag-filter" className="w-full">
                  <SelectValue placeholder="Filter berdasarkan tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag === 'all' ? 'Semua Tag' : tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || selectedCategory !== 'all' || selectedTag !== 'all') && (
                 <Button onClick={resetFilters} variant="outline" className="w-full lg:w-auto lg:justify-self-start">
                    <XCircle className="mr-2 h-4 w-4" /> Reset Filter
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="flex flex-col overflow-hidden h-full">
              <div className="aspect-video bg-muted animate-pulse"></div>
              <CardContent className="p-4 flex-grow">
                <div className="h-6 w-3/4 bg-muted animate-pulse mb-2 rounded"></div>
                <div className="h-4 w-full bg-muted animate-pulse mb-1 rounded"></div>
                <div className="h-4 w-5/6 bg-muted animate-pulse mb-3 rounded"></div>
                <div className="h-8 w-1/2 bg-muted animate-pulse rounded"></div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-headline text-2xl font-semibold text-foreground mb-2">Produk Tidak Ditemukan</h3>
          <p className="text-muted-foreground">
            Coba sesuaikan pencarian atau filter Anda.
          </p>
          <Button onClick={resetFilters} className="mt-4">
            <XCircle className="mr-2 h-4 w-4" /> Hapus Filter dan Pencarian
          </Button>
        </div>
      )}
    </StoreLayout>
  );
}