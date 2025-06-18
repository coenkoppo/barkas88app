
'use client';

import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
        <AdminSidebar />
        <SidebarInset>
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm md:hidden">
                {/* Mobile header content, e.g., breadcrumbs, search, mobile sidebar trigger */}
                <SidebarTrigger className="md:hidden" /> {/* Ensure this is visible on mobile */}
                <h1 className="text-lg font-semibold font-headline">Panel Admin</h1>
            </header>
            <main className="flex-1 p-4 md:p-8 overflow-auto">
                 {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
