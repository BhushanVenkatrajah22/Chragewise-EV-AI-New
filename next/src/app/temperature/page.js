"use client";
import React, { useState, useEffect } from 'react';
import { Thermometer, AlertCircle, TrendingDown, ShieldCheck, Flame, Wind } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { useEVData } from '@/context/EVDataContext';

export default function TemperaturePage() {
  const { vehicleData, insights } = useEVData();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (vehicleData.isConnected) {
      setHistory(h => [...h.slice(-19), { 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
        temp: vehicleData.temperature 
      }]);
    }
  }, [vehicleData]);

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
          <Thermometer className="w-10 h-10 text-slate-200 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-900 font-outfit">Thermal Data Offline</h3>
          <p className="text-slate-500 text-xs mt-1">Connect your vehicle to monitor cooling systems in real-time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Thermal Intelligence</h2>
        <p className="text-slate-500 text-xs mt-1">Real-time heat distribution across all power modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ThermalKpi title="Current Temp" value={`${vehicleData.temperature}°C`} icon={Thermometer} color="text-blue-600" />
        <ThermalKpi title="Risk Level" value={insights?.risk_level || 'Analyzing...'} icon={Flame} color={insights?.risk_level === 'High' ? 'text-red-600' : 'text-green-600'} />
        <ThermalKpi title="System State" value={insights?.behavior || 'Stable'} icon={ShieldCheck} color="text-slate-600" />
        <ThermalKpi title="Anomaly Count" value="0" icon={AlertCircle} color="text-slate-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-sm mb-6 font-outfit uppercase tracking-widest text-slate-400">Thermal Profile (Live)</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} fill="url(#tempGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-blue-400 mb-4">Groq AI Thermal Diagnostic</h4>
            <p className="text-slate-300 text-xs leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
              "{insights?.ai_diagnostic || "Awaiting heat map telemetry for module-level deep sweep..."}"
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-3">AI Cooling Advice</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {insights?.coach_advice || "Analyzing ambient vs core delta to optimize cooling cycles..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThermalKpi({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
      <div className="flex items-center gap-4">
        <div className={`p-2 bg-slate-50 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-lg font-bold text-slate-900 font-outfit mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}
