"use client";
import React, { useState, useEffect } from 'react';
import { Activity, Zap, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useEVData } from '@/context/EVDataContext';

export default function DrivingPage() {
  const { vehicleData, insights } = useEVData();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (vehicleData.isConnected) {
      setHistory(h => {
        const newPoint = { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          speed: vehicleData.speed 
        };
        return [...h, newPoint].slice(-20);
      });
    }
  }, [vehicleData]);

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
          <Activity className="w-10 h-10 text-slate-200 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-900 font-outfit">Driving Analytics Offline</h3>
          <p className="text-slate-500 text-xs mt-1">Real-time driver behavior analysis requires a live telemetry stream.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Driving Analytics</h2>
        <p className="text-slate-500 text-xs mt-1 text-xs">Performance scoring based on acceleration, braking, and energy recovery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(val) => `${val}km/h`}
                  width={50}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSpeed)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <BehaviorCard title="Current Speed" value={`${vehicleData.speed} km/h`} icon={Zap} status="optimal" />
            <BehaviorCard title="Driving Style" value={insights?.behavior || "Analyzing..."} icon={CheckCircle2} status="optimal" />
            <BehaviorCard title="Safety Tier" value="Enterprise" icon={TrendingUp} status="optimal" />
            <BehaviorCard title="G-Force Risk" value={insights?.risk_level || "Low"} icon={ShieldAlert} status={insights?.risk_level === 'High' ? 'warning' : 'optimal'} />
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-blue-400 w-4 h-4" />
              <h3 className="font-bold text-sm font-outfit uppercase tracking-wider">AI Driver Coach</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
              "{insights?.coach_advice || "Analyzing longitudinal and lateral acceleration for optimization tips..."}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BehaviorCard({ title, value, icon: Icon, status }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-lg font-bold text-slate-900 mt-1 font-outfit">{value}</p>
        </div>
        <div className={`p-1.5 rounded-lg ${status === 'optimal' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
