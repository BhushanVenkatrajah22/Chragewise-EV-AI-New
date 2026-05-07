"use client";
import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import { useEVData } from '@/context/EVDataContext';

export default function HealthPage() {
  const { vehicleData, insights } = useEVData();

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="p-10 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900 font-outfit">Vehicle Health Offline</h3>
          <p className="text-slate-500 text-xs mt-1">Full system health scans require a live telemetry connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Vehicle Health</h2>
        <p className="text-slate-500 text-xs mt-1 text-xs">Full system audit and structural integrity monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
           <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center relative mb-6">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full opacity-20" />
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin-slow" />
              <span className="text-4xl font-bold text-slate-900 font-outfit">{insights?.health_score || vehicleData.healthScore || 0}%</span>
           </div>
           <h3 className="text-lg font-bold text-slate-900 font-outfit">Aggregate Health Score</h3>
           <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">Llama 3 Neural Assessment</p>
        </div>

        <div className="space-y-3">
           <HealthMetric label="Powertrain Logic" health={99} status="optimal" />
           <HealthMetric label="Battery Chemistry" health={insights?.health_score || 0} status={insights?.health_score > 90 ? 'optimal' : 'warning'} />
           <HealthMetric label="Thermal Exchange" health={98} status="optimal" />
           <HealthMetric label="Sensory Network" health={100} status="optimal" />
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-blue-500/20 rounded-xl">
              <Activity className="text-blue-400 w-6 h-6" />
           </div>
           <h3 className="text-xl font-bold font-outfit uppercase tracking-wider">AI Forensic Diagnostic</h3>
        </div>
        <p className="text-base text-slate-300 leading-relaxed italic border-l-4 border-blue-500 pl-6 py-2 bg-white/5 rounded-r-xl">
           "{insights?.ai_diagnostic || "Awaiting sensor data for full structural and electronic forensic sweep..."}"
        </p>
      </div>
    </div>
  );
}

function HealthMetric({ label, health, status }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center group hover:border-blue-200 transition-colors">
       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-900">{health}%</span>
          <div className={`w-2 h-2 rounded-full ${status === 'optimal' ? 'bg-green-500' : 'bg-amber-500'} shadow-sm shadow-current`} />
       </div>
    </div>
  );
}
