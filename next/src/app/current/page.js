"use client";
import React from 'react';
import { Activity, Zap, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { useEVData } from '@/context/EVDataContext';

export default function CurrentPage() {
  const { vehicleData, insights } = useEVData();

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="p-10 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900 font-outfit">Load Analysis Offline</h3>
          <p className="text-slate-500 text-xs mt-1">Real-time current flow analysis requires a telemetry stream.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Current Flow</h2>
        <p className="text-slate-500 text-xs mt-1 text-xs">Real-time load analysis and energy consumption patterns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricSmall title="Live Load" value={`${vehicleData.current} A`} icon={Activity} />
        <MetricSmall title="Bus State" value="Nominal" icon={Zap} />
        <MetricSmall title="System Load" value="Verified" icon={TrendingUp} />
        <MetricSmall title="Behavior" value={insights?.behavior || "Analysing..."} icon={AlertCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-sm font-outfit uppercase tracking-widest text-slate-400">Current Draw (A)</h3>
             <span className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
               <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
               High-Freq Sampling
             </span>
          </div>
          <div className="h-[250px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
             <div className="text-center">
                <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oscilloscope Active</p>
                <p className="text-[10px] text-slate-400 mt-1">Streaming live current wave from inverter...</p>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-blue-500/20 rounded-xl">
                    <BarChart3 className="text-blue-400 w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-sm font-outfit uppercase tracking-widest text-blue-400">Efficiency AI</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
                 "{insights?.coach_advice || "Analyzing parasitic drain and auxiliary consumption offsets..."}"
              </p>
           </div>
           
           <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Load Balance</span>
                 <span className="text-xs font-bold text-blue-400">Optimal</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-[92%]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricSmall({ title, value, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-colors">
      <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-lg font-bold text-slate-900 font-outfit">{value}</p>
      </div>
    </div>
  );
}
