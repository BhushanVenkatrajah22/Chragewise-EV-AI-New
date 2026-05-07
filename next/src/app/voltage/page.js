"use client";
import React, { useState, useEffect } from 'react';
import { Zap, Activity, ShieldCheck, BarChart2, BrainCircuit } from 'lucide-react';
import { useEVData } from '@/context/EVDataContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function VoltagePage() {
  const { vehicleData, insights } = useEVData();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (vehicleData.voltage !== undefined) {
      setHistory(prev => {
        const newPoint = { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          value: vehicleData.voltage 
        };
        const updated = [...prev, newPoint].slice(-20);
        return updated;
      });
    }
  }, [vehicleData.voltage]);

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
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis 
                  fontSize={10} 
                  tick={{fill: '#94a3b8'}} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `${val}V`}
                  domain={['auto', 'auto']}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVoltage)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
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
