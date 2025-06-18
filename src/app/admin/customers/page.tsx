
'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, Search } from 'lucide-react';
import type { CustomerInfo } from '@/types';
import { getAdminCustomers } from '@/lib/actions';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button'; // For future actions

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      setIsLoading(true);
      try {
        const fetchedCustomers = await getAdminCustomers();
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Gagal memuat pelanggan:", error);
        toast({ title: 'Gagal Memuat Pelanggan', description: 'Tidak dapat mengambil daftar pelanggan.', variant: 'destructive' });
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phoneNumber && customer.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => a.name.localeCompare(b.name));

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary">Kelola Pelanggan</h1>
          <p className="text-muted-foreground">Lihat daftar pelanggan yang telah melakukan pesanan.</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="font-headline text-xl">Daftar Pelanggan</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, telepon, alamat..."
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
                <p className="text-muted-foreground">Memuat data pelanggan...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{searchTerm ? "Tidak ada pelanggan yang cocok." : "Belum ada data pelanggan."}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Alamat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <TableRow key={customer.phoneNumber + '-' + index}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell>{customer.address}</TableCell>
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
