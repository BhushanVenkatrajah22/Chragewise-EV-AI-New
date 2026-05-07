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
        <div className="h-screen w-screen overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </EVDataProvider>
    );
  }

  return (
    <EVDataProvider>
      {/* Global Toast lives inside the provider so it can access EVDataContext */}
      <GlobalToast />
      <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc]">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col relative overflow-hidden">
          {/* Global Top Right Utilities */}
          <div className="absolute top-8 right-8 z-50">
            <TelemetryUploader />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-[1600px] mx-auto page-transition pt-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </EVDataProvider>
  );
}
