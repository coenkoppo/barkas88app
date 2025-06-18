
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ListOrdered, Package, Users, BarChartBig } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Pendapatan', value: 'Rp 125.500.000', icon: DollarSign, change: '+12.5%', changeType: 'positive' as const },
    { title: 'Pesanan Baru', value: '72', icon: ListOrdered, change: '+5', changeType: 'positive' as const },
    { title: 'Produk Tersedia', value: '1,280', icon: Package, change: '-15', changeType: 'negative' as const },
    { title: 'Pelanggan Aktif', value: '345', icon: Users, change: '+8.2%', changeType: 'positive' as const },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
            <h1 className="font-headline text-3xl font-bold text-primary">Dasbor Admin</h1>
            <p className="text-muted-foreground">Gambaran umum kinerja toko Anda.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline text-foreground">{stat.value}</div>
                <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'} mt-1`}>
                  {stat.change} dari bulan lalu
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Aktivitas Terbaru</CardTitle>
                    <CardDescription>Pesanan terbaru dan interaksi pelanggan.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Placeholder for recent activity feed */}
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full"><ListOrdered className="h-5 w-5 text-primary"/></div>
                            <div>Pesanan baru #ORD007 oleh Andika P. sebesar Rp 750.000</div>
                            <div className="ml-auto text-xs text-muted-foreground">2 menit lalu</div>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-full"><Users className="h-5 w-5 text-green-600"/></div>
                            <div>Registrasi pelanggan baru: Budi S.</div>
                            <div className="ml-auto text-xs text-muted-foreground">15 menit lalu</div>
                        </li>
                         <li className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full"><ListOrdered className="h-5 w-5 text-primary"/></div>
                            <div>Status pesanan #ORD005 diperbarui menjadi Dikirim.</div>
                            <div className="ml-auto text-xs text-muted-foreground">1 jam lalu</div>
                        </li>
                    </ul>
                </CardContent>
            </Card>
            <Card className="shadow-md">
                 <CardHeader>
                    <CardTitle className="font-headline text-xl">Gambaran Penjualan</CardTitle>
                    <CardDescription>Grafik kinerja penjualan bulanan.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    {/* Placeholder for a chart */}
                    <div className="text-center text-muted-foreground">
                        <BarChartBig className="h-16 w-16 mx-auto mb-2"/>
                        Grafik penjualan akan segera hadir.
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </AdminLayout>
  );
}
