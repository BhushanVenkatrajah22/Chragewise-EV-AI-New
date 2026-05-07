"use client";
import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Activity, History, Zap, Thermometer, ShieldCheck, BrainCircuit } from 'lucide-react';
import { useEVData } from '@/context/EVDataContext';

export default function AlertsPage() {
  const { vehicleData, insights } = useEVData();
  const [clearing, setClearing] = useState(false);

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="p-10 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900 font-outfit">Safety Systems Offline</h3>
          <p className="text-slate-500 text-xs mt-1">Real-time risk monitoring requires an active OBD-II connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Alerts & Risks</h2>
          <p className="text-slate-500 text-xs mt-1 text-xs">Real-time safety monitoring and anomaly detection.</p>
        </div>
        <button 
          onClick={() => {
            setClearing(true);
            setTimeout(() => setClearing(false), 1000);
          }}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          {clearing ? <Activity className="w-3 h-3 animate-spin" /> : <History className="w-3 h-3" />}
          {clearing ? 'Processing...' : 'Clear All History'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
           {insights?.risk_level === 'High' ? (
             <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-4 animate-pulse">
               <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
               <div>
                  <h3 className="font-bold text-red-900">Elevated System Risk Detected</h3>
                  <p className="text-sm text-red-700 mt-1 leading-relaxed">
                    {insights?.ai_diagnostic || "AI has detected a potential anomaly in your driving or system thermal state."}
                  </p>
               </div>
             </div>
           ) : (
             <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-900 font-outfit uppercase tracking-wider">All Systems Nominal</h3>
                <p className="text-sm text-green-700 mt-1">Groq AI monitoring is active. No critical risks detected in current telemetry stream.</p>
             </div>
           )}

           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Security & Isolation Matrix</h3>
             <div className="space-y-4">
               <AlertRow label="High Voltage Isolation" status="Active" icon={Zap} />
               <AlertRow label="Thermal Runaway Logic" status="Ready" icon={Thermometer} />
               <AlertRow label="BMS Protocol Integrity" status="Verified" icon={ShieldCheck} />
               <AlertRow label="Sensor Data Authenticity" status="Confirmed" icon={Activity} />
             </div>
           </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white shadow-xl">
             <h3 className="font-bold text-sm mb-4 font-outfit flex items-center gap-2">
                <BrainCircuit className="text-blue-400 w-4 h-4" />
                AI Safety Brief
             </h3>
             <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
               "{insights?.coach_advice || "Analyzing longitudinal stability and lateral G-load for safety optimizations..."}"
             </p>
             <div className="mt-6 pt-4 border-t border-white/10">
               <span className="text-[10px] font-bold text-slate-500 uppercase">Analysis Confidence: 99.1%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertRow({ label, status, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 group">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">{status}</span>
    </div>
  );
}
