"use client";
import React from 'react';
import { Activity, Zap, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react';
import { useEVData } from '@/context/EVDataContext';

export default function DrivingPage() {
  const { vehicleData, insights } = useEVData();

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
          <h3 className="font-bold text-sm mb-8 font-outfit uppercase tracking-widest text-slate-400">Efficiency Radar</h3>
          <div className="w-40 h-40 border-2 border-slate-50 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin-slow opacity-20" />
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 font-outfit">{vehicleData.safetyScore || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Score</p>
            </div>
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
