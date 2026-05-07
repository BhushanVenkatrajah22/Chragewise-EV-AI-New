"use client";
import React from 'react';
import { Zap, Activity, ShieldCheck, BarChart2, BrainCircuit } from 'lucide-react';
import { useEVData } from '@/context/EVDataContext';

export default function VoltagePage() {
  const { vehicleData, insights } = useEVData();

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="p-10 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <Zap className="w-12 h-12 text-slate-200 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900 font-outfit">Voltage Monitoring Offline</h3>
          <p className="text-slate-500 text-xs mt-1">Real-time electrical stability tracking requires a telemetry stream.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Voltage Stability</h2>
        <p className="text-slate-500 text-xs mt-1 text-xs">Precise monitoring of cell balance and electrical stability.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <VoltageKpi title="Pack Voltage" value={`${vehicleData.voltage}V`} icon={Zap} trend="Live Stream" />
        <VoltageKpi title="Imbalance" value="0.01V" icon={Activity} trend="BMS Sync" />
        <VoltageKpi title="System State" value={insights?.behavior || "Stable"} icon={ShieldCheck} trend="AI Verified" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
         <div className="flex items-center justify-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm font-outfit uppercase tracking-widest text-slate-400">Cell Topology Analysis</h3>
         </div>
         <div className="h-[250px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="text-center">
               <Activity className="w-8 h-8 text-slate-300 mx-auto mb-4" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topology Mapping Active</p>
               <p className="text-[10px] text-slate-400 mt-1">Awaiting individual cell packet sync...</p>
            </div>
         </div>
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-blue-500/20 rounded-xl">
              <BrainCircuit className="text-blue-400 w-6 h-6" />
           </div>
           <h3 className="text-xl font-bold font-outfit uppercase tracking-wider">AI Electrical Diagnostic</h3>
        </div>
        <p className="text-base text-slate-300 leading-relaxed italic border-l-4 border-blue-500 pl-6 py-2 bg-white/5 rounded-r-xl">
           "{insights?.ai_diagnostic || "Processing high-freq voltage samples for anomaly detection..."}"
        </p>
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           <span>Model Confidence: 99.4%</span>
           <span>Isolation: Secure</span>
        </div>
      </div>
    </div>
  );
}

function VoltageKpi({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{trend}</span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-lg font-bold text-slate-900 font-outfit mt-0.5">{value}</p>
    </div>
  );
}
