"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
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
          {/* Global Top Left - Back to Connect */}
          <div className="absolute top-8 left-8 z-50">
            <Link 
              href="/connect"
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group"
            >
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Vehicles
            </Link>
          </div>

          {/* Global Top Right Utilities */}
          <div className="absolute top-8 right-8 z-50">
            <TelemetryUploader />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-[1600px] mx-auto page-transition pt-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </EVDataProvider>
  );
}
