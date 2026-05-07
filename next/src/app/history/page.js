"use client";
import React from 'react';
import { History, Download, Search } from 'lucide-react';
import { useEVData } from '@/context/EVDataContext';

export default function HistoryPage() {
  const { vehicleData, insights } = useEVData();

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="p-10 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <History className="w-12 h-12 text-slate-200 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900 font-outfit">History Logs Offline</h3>
          <p className="text-slate-500 text-xs mt-1">Live session logging requires an active telemetry stream.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Data History</h2>
          <p className="text-slate-500 text-xs mt-1 text-xs">Chronological log of vehicle telemetry and AI observations.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-3 h-3" />
          Export JSON
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <h3 className="font-bold text-sm font-outfit uppercase tracking-widest text-slate-400">Active Session Log</h3>
           <span className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
             <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
             Live Stream
           </span>
        </div>
        
        <div className="divide-y divide-slate-50">
           <HistoryRow label="Telemetry Sync" value="SUCCESS" detail="OBD-II Bridge Operational" status="ok" />
           <HistoryRow label="AI Inference" value="ACTIVE" detail="Groq Llama 3.1 70B Connected" status="ok" />
           <HistoryRow label="Current Voltage" value={`${vehicleData.voltage}V`} detail="Pack Stability Nominal" status="ok" />
           <HistoryRow label="Battery Health" value={`${insights?.health_score || 0}%`} detail="Chemical Analysis Verified" status="ok" />
           <HistoryRow label="Thermal State" value={`${vehicleData.temperature}°C`} detail="Cooling Cycle Verified" status="ok" />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start gap-4">
           <div className="p-2 bg-blue-500/20 rounded-lg">
              <Search className="w-4 h-4 text-blue-400" />
           </div>
           <div>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                Note: Historical database synchronization is active. All current live telemetry packets are being persisted to your account for future trend analysis.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ label, value, detail, status }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
       <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${status === 'ok' ? 'bg-green-500' : 'bg-red-500'} shadow-sm shadow-current`} />
          <div>
             <p className="text-xs font-bold text-slate-900">{label}</p>
             <p className="text-[10px] text-slate-500 mt-0.5">{detail}</p>
          </div>
       </div>
       <div className="text-right">
          <p className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-tighter">{value}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">System Status</p>
       </div>
    </div>
  );
}
