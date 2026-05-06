"use client";
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { time: '10:00', soc: 85, speed: 45 },
  { time: '10:05', soc: 84, speed: 52 },
  { time: '10:10', soc: 82, speed: 60 },
  { time: '10:15', soc: 81, speed: 48 },
  { time: '10:20', soc: 79, speed: 55 },
  { time: '10:25', soc: 78, speed: 65 },
  { time: '10:30', soc: 76, speed: 50 },
];

const TelemetryCharts = () => {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-6">Vehicle Telemetry</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorSoc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="soc" 
              stroke="#3B82F6" 
              fillOpacity={1} 
              fill="url(#colorSoc)" 
              strokeWidth={3}
              name="Battery %"
            />
            <Area 
              type="monotone" 
              dataKey="speed" 
              stroke="#1e293b" 
              fill="transparent"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Speed km/h"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TelemetryCharts;
