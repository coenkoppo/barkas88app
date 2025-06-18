
'use client';

import Image from 'next/image';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Zap, Package } from 'lucide-react';
import { useCart } from '@/context/CartProvider';
import { toast } from '@/hooks/use-toast';
import { ProductTag } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: `${product.name} ditambahkan ke keranjang!`,
      description: "Anda dapat melihat keranjang atau melanjutkan belanja.",
      duration: 3000,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const getTagIcon = (tag: ProductTag) => {
    switch (tag) {
      case ProductTag.FastSelling:
        return <Zap className="h-3 w-3 mr-1" />;
      case ProductTag.LimitedStock:
        return <Package className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${product.category} ${product.name.split(' ').slice(0,1).join(' ')}`}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-lg mb-1 leading-tight h-12 line-clamp-2">{product.name}</CardTitle>
        <div className="flex flex-wrap gap-1 my-2">
          {product.tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant={tag === ProductTag.LimitedStock || tag === ProductTag.OnSale ? "destructive" : "secondary"} className="text-xs py-0.5 px-1.5">
             {getTagIcon(tag)} {tag}
            </Badge>
          ))}
        </div>
        <CardDescription className="text-sm text-muted-foreground mb-2 h-10 line-clamp-2">{product.description}</CardDescription>
        <p className="font-headline text-xl font-semibold text-primary">{formatPrice(product.price)}</p>
        {product.stock < 20 && product.tags.includes(ProductTag.LimitedStock) && (
             <p className="text-xs text-destructive mt-1">Hanya tersisa {product.stock} stok!</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} className="w-full" aria-label={`Tambah ${product.name} ke keranjang`}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Tambah ke Keranjang
        </Button>
      </CardFooter>
    </Card>
  );
}
