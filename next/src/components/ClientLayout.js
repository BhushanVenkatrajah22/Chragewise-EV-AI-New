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
        <div className="h-screen w-screen overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            {/* Simple Watermark for Auth Pages */}
            <footer className="py-20 border-t border-slate-100/50">
              <div className="flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain grayscale" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-500 tracking-tight font-outfit uppercase">Chargewise</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">AI Automotive Network © 2026</p>
                </div>
              </div>
            </footer>
          </div>
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

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-4">
            <div className="max-w-[1600px] mx-auto page-transition pt-12 min-h-[calc(100vh-120px)] flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              
              {/* Production-Level Watermark / Footer */}
              <footer className="mt-20 pt-20 border-t border-slate-100 pb-20">
                <div className="flex flex-col items-center justify-center text-center space-y-8">
                  <div className="flex flex-col items-center gap-6">
                    <img src="/logo.png" alt="Logo" className="w-32 h-32 object-contain opacity-40 grayscale pointer-events-none" />
                    <div>
                      <h3 className="text-2xl font-bold text-slate-400 tracking-tight font-outfit uppercase">Chargewise</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] leading-none mt-2">AI Intelligence Network</p>
                    </div>
                  </div>
                  <div className="max-w-2xl px-6">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                      Advanced Enterprise-Grade Electric Vehicle Analytics & Predictive Maintenance Platform. 
                      Neural Diagnostics Powered by Groq Llama 3.1 70B. 
                    </p>
                    <p className="text-[9px] text-slate-400 mt-4 font-bold uppercase tracking-[0.3em]">
                      Automotive Intelligence Systems © 2026. All Rights Reserved.
                    </p>
                  </div>
                  <div className="flex gap-8 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                    <span>ISO 27001</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full my-auto" />
                    <span>GDPR</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full my-auto" />
                    <span>AES-256</span>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </EVDataProvider>
  );
}
