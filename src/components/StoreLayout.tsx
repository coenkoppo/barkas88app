
import React from 'react';
import { Header } from '@/components/Header';

interface StoreLayoutProps {
  children: React.ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-muted/50 py-6 text-center text-muted-foreground text-sm">
        <div className="container">
          © {new Date().getFullYear()} Bali88 Digital Sales. Hak cipta dilindungi.
        </div>
      </footer>
    </div>
  );
}
