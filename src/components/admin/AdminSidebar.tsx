
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar, // Import useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, ListOrdered, PackageSearch, Sparkles, LogOut, Settings, Package, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '../ui/separator';
import { SheetTitle } from '@/components/ui/sheet';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dasbor', icon: Home },
  { href: '/admin/orders', label: 'Pesanan', icon: ListOrdered },
  { href: '/admin/products', label: 'Produk', icon: Package },
  { href: '/admin/customers', label: 'Pelanggan', icon: Users },
  { href: '/admin/upselling', label: 'Upselling AI', icon: Sparkles },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar(); // Get isMobile state

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-4 items-center">
        <Link href="/admin/dashboard" className="flex items-center gap-2 w-full">
          <PackageSearch className="h-8 w-8 text-primary group-data-[collapsible=icon]:mx-auto" />
          {isMobile ? (
            <SheetTitle className="font-headline text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
              Bali88 Admin
            </SheetTitle>
          ) : (
            <span className="font-headline text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
              Bali88 Admin
            </span>
          )}
        </Link>
        <div className="md:hidden ml-auto"> {/* Only show trigger on mobile if sidebar is part of sheet */}
             <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))}
                tooltip={{ children: item.label, className: "ml-2"}}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <Separator className="my-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-3/4"/>

      <SidebarFooter className="p-2 items-stretch">
         <div className="flex items-center p-2 gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Admin User" data-ai-hint="person user" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-sidebar-foreground">Pengguna Admin</span>
                <span className="text-xs text-muted-foreground">manager@bali88.com</span>
            </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:p-0">
            <Settings className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Pengaturan</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:p-0">
            <LogOut className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Keluar</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
