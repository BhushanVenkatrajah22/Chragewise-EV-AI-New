"use client";
import React, { useState, useEffect } from 'react';
import { Battery, Zap, TrendingUp, ShieldCheck, Info } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import { useEVData } from '@/context/EVDataContext';

export default function BatteryPage() {
  const { vehicleData, insights } = useEVData();

  const pieData = [
    { name: 'Used', value: 100 - (vehicleData.batteryLevel || 0) },
    { name: 'Remaining', value: vehicleData.batteryLevel || 0 },
  ];

  const COLORS = ['#e2e8f0', '#2563eb'];

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="p-10 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <Battery className="w-12 h-12 text-slate-200 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900 font-outfit">Waiting for Telemetry</h3>
          <p className="text-slate-500 text-xs mt-1">Connect your OBD-II to view real-time battery analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Battery Intelligence</h2>
        <p className="text-slate-500 text-xs mt-1 text-xs">Deep analysis of energy storage and chemical degradation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-8 shadow-sm">
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-6">
            <p className="text-3xl font-bold text-slate-900 font-outfit">{vehicleData.batteryLevel}%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Energy Capacity</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Battery Health (SOH)" value={`${insights?.health_score || vehicleData.healthScore || 0}%`} icon={ShieldCheck} trend="AI Calculated" />
            <StatCard title="System Voltage" value={`${vehicleData.voltage}V`} icon={Zap} trend="Live Stream" />
            <StatCard title="Input Current" value={`${vehicleData.current}A`} icon={TrendingUp} trend="Real-time" />
            <StatCard title="Operating Temp" value={`${vehicleData.temperature}°C`} icon={Battery} trend="Thermal Logic" />
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="text-blue-400 w-4 h-4" />
              <h3 className="font-bold text-sm">Groq AI Diagnostic</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
              "{insights?.ai_diagnostic || "Analyzing chemical impedance and thermal patterns for health verification..."}"
            </p>
            <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${insights?.health_score || 0}%` }} />
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] font-bold text-slate-500 uppercase">
              <span>SOH: {insights?.health_score || 0}%</span>
              <span>Stability: {insights?.risk_level || 'Checking...'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
      <div className="flex justify-between items-start mb-2">
        <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
          <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">{trend}</span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-lg font-bold text-slate-900 mt-0.5 font-outfit">{value}</p>
    </div>
  );
}
