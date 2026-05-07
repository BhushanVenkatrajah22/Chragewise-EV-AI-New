"use client";
import React, { useState, useEffect } from 'react';
import { Timer, Zap, BatteryCharging, ShieldCheck, History, Info, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useEVData } from '@/context/EVDataContext';

export default function ChargingPage() {
  const { vehicleData, insights } = useEVData();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (vehicleData.isConnected) {
      const power = (vehicleData.voltage * vehicleData.current) / 1000; // Power in kW
      setHistory(h => {
        const newPoint = { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          power: Math.abs(power) 
        };
        return [...h, newPoint].slice(-20);
      });
    }
  }, [vehicleData]);

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
          <Zap className="w-10 h-10 text-slate-200 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-900 font-outfit">Waiting for Charging Data</h3>
          <p className="text-slate-500 text-xs mt-1">Connect your vehicle to analyze charging cycles and efficiency.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Charging Intelligence</h2>
        <p className="text-slate-500 text-xs mt-1">Real-time optimization of energy ingestion and thermal safety.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChargeStat title="Input Voltage" value={`${vehicleData.voltage}V`} icon={Zap} />
        <ChargeStat title="Charge Current" value={`${vehicleData.current}A`} icon={BatteryCharging} />
        <ChargeStat title="Ingestion Health" value={insights?.health_score ? `${insights.health_score}%` : "Analyzing..."} icon={ShieldCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-sm mb-6 font-outfit">AI Power Delivery Analysis</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(val) => `${val.toFixed(1)}kW`}
                  width={50}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="power" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPower)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[1.5rem] p-6 shadow-xl">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2 font-outfit">
              <Zap className="text-blue-400 w-4 h-4" />
              Groq AI Advice
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
              {insights?.coach_advice || "Analyzing charging patterns to optimize for battery longevity..."}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-4">Last Sync Diagnostics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Predicted Range</span>
                <span className="font-bold text-slate-900">{insights?.predicted_range || 0} km</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${vehicleData.batteryLevel}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChargeStat({ title, value, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
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
