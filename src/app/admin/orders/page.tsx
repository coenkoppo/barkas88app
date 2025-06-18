
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Eye, Filter, Search, Trash2, MoreHorizontal, ListOrdered, Loader2 } from 'lucide-react';
import type { Order } from '@/types';
import { OrderStatus } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';
import { getAdminOrders } from '@/lib/actions'; // Import the server action

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        const fetchedOrders = await getAdminOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Gagal memuat pesanan:", error);
        toast({ title: 'Gagal Memuat Pesanan', description: 'Tidak dapat mengambil daftar pesanan.', variant: 'destructive' });
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customerInfo.phoneNumber && order.customerInfo.phoneNumber.includes(searchTerm))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Paid:
      case OrderStatus.Delivered:
        return 'default'; // Primary (Green in current theme) - Positive/Completed
      case OrderStatus.DPPaid: // "belum lunas" -> "merah atau kuning" -> using 'destructive' (merah) for attention
        return 'destructive'; 
      case OrderStatus.AwaitingPayment: // Needs payment attention - using secondary (softer green)
      case OrderStatus.Pending:       // Needs attention - using secondary (softer green)
        return 'secondary'; 
      case OrderStatus.Processing:
      case OrderStatus.Shipped:
        return 'outline';   // Neutral - In progress
      case OrderStatus.Cancelled:
      case OrderStatus.Refunded:
        return 'destructive'; // Red - Problematic/Final negative status
      default:
        return 'outline';
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    // Placeholder for delete logic
    // In a real app, this would be a server action call
    // await deleteOrderAction(orderId);
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    toast({
      title: `Pesanan ${orderId} Dihapus`,
      description: "Pesanan telah dihapus (simulasi).",
    });
  };


  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold text-primary">Kelola Pesanan</h1>
            <p className="text-muted-foreground">Lihat, buat, dan kelola pesanan pelanggan.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/orders/new">
              <PlusCircle className="mr-2 h-5 w-5" /> Buat Pesanan Baru
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="font-headline text-xl">Daftar Pesanan</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari berdasarkan ID, Nama, Telepon..." 
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters</Button> */}
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="text-center py-8">
                    <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-2" />
                    <p className="text-muted-foreground">Memuat pesanan...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                    <ListOrdered className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">{searchTerm ? "Tidak ada pesanan yang cocok dengan pencarian Anda." : "Belum ada pesanan."}</p>
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pesanan</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-primary">{order.id}</TableCell>
                    <TableCell>
                        <div>{order.customerInfo.name}</div>
                        <div className="text-xs text-muted-foreground">{order.customerInfo.phoneNumber}</div>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                    <TableCell className="text-right">{formatPrice(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
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
                            <Link href={`/admin/orders/${order.id}/edit`} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                            </Link>
                          </DropdownMenuItem>
                           <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}/edit`} className="cursor-pointer">
                              <Edit3 className="mr-2 h-4 w-4" /> Edit Pesanan
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <AlertDialog> 
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive cursor-pointer" onSelect={(e) => e.preventDefault()}>
                                      <Trash2 className="mr-2 h-4 w-4" /> Hapus Pesanan
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pesanan <span className="font-semibold">{order.id}</span> secara permanen.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                        Hapus
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
