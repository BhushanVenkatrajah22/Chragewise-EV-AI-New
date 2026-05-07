"use client";
import React from 'react';
import { Wrench, ShieldCheck } from 'lucide-react';
import { useEVData } from '@/context/EVDataContext';

export default function MaintenancePage() {
  const { vehicleData, insights } = useEVData();

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="p-10 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <Wrench className="w-12 h-12 text-slate-200 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900 font-outfit">Maintenance Data Offline</h3>
          <p className="text-slate-500 text-xs mt-1">Predictive component tracking requires a telemetry stream.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Predictive Maintenance</h2>
        <p className="text-slate-500 text-xs mt-1 text-xs">AI-driven failure prediction and component health tracking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 font-outfit">Component Health Matrix</h3>
            <div className="space-y-6">
              <ComponentRow name="Traction Inverter" health={98} lastSync="Live" />
              <ComponentRow name="Battery Thermal Unit" health={insights?.health_score || 0} lastSync="Live" />
              <ComponentRow name="DC-DC Converter" health={99} lastSync="Live" />
              <ComponentRow name="HV Isolation System" health={100} lastSync="Live" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white shadow-xl">
            <h3 className="font-bold text-sm mb-5 font-outfit flex items-center gap-2">
               <ShieldCheck className="text-blue-400 w-4 h-4" />
               Groq AI Intelligence
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
               "{insights?.ai_diagnostic || "Analyzing component duty cycles for RUL (Remaining Useful Life) prediction..."}"
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
             <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-4">Service Schedule</h4>
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
               <p className="text-xs font-bold text-slate-900">Next Systematic Check</p>
               <p className="text-[10px] text-slate-500 mt-1">Awaiting 500km baseline data for AI scheduling.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentRow({ name, health, lastSync }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${health > 90 ? 'bg-green-500' : 'bg-amber-500'} shadow-sm shadow-current`} />
        <div>
          <p className="text-xs font-bold text-slate-900">{name}</p>
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Status: {lastSync}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-slate-900">{health}%</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase">Health</p>
      </div>
    </div>
  );
}
