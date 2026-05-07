"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TelemetryUploader from './TelemetryUploader';
import GlobalToast from './GlobalToast';
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
      {/* Global Toast lives inside the provider so it can access EVDataContext */}
      <GlobalToast />
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 min-h-screen relative">
          {/* Global Top Right Utilities */}
          <div className="absolute top-8 right-8 z-50">
            <TelemetryUploader />
          </div>

          <div className="max-w-[1600px] mx-auto page-transition pt-12">
            {children}
          </div>
        </main>
      </div>
    </EVDataProvider>
  );
}
