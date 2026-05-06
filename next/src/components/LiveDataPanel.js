import React from 'react';
import { Battery, Zap, Thermometer, Gauge } from 'lucide-react';

const LiveDataPanel = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
        <Battery className={`w-10 h-10 mb-2 ${data.soc < 20 ? 'text-red-500' : 'text-blue-600'}`} />
        <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Battery</span>
        <span className="text-3xl font-bold mt-1">{data.soc}%</span>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
        <Gauge className="w-10 h-10 mb-2 text-slate-700" />
        <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Speed</span>
        <span className="text-3xl font-bold mt-1">{data.speed} <span className="text-lg font-normal text-slate-400">km/h</span></span>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
        <Thermometer className="w-10 h-10 mb-2 text-slate-700" />
        <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Temp</span>
        <span className="text-3xl font-bold mt-1">{data.temp}°C</span>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
        <Zap className="w-10 h-10 mb-2 text-slate-700" />
        <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Voltage</span>
        <span className="text-3xl font-bold mt-1">{data.voltage} <span className="text-lg font-normal text-slate-400">V</span></span>
      </div>
    </div>
  );
};

export default LiveDataPanel;
