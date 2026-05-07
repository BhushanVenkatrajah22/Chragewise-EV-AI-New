"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { EVDataProvider } from '@/context/EVDataContext';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/connect'].includes(pathname);

  if (isAuthPage) {
    return (
      <EVDataProvider>
        {children}
      </EVDataProvider>
    );
  }

  return (
    <EVDataProvider>
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 min-h-screen">
          <div className="max-w-[1600px] mx-auto page-transition">
            {children}
          </div>
        </main>
      </div>
    </EVDataProvider>
  );
}
