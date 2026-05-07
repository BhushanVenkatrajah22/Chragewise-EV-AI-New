"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  ShieldCheck, 
  Battery, 
  Zap, 
  Activity, 
  AlertCircle, 
  Navigation,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

import { useEVData } from '@/context/EVDataContext';

export default function DashboardPage() {
  const router = useRouter();
  const { vehicleData, insights, connectVehicle, disconnectVehicle, selectedVehicle } = useEVData();
  const [currentUser, setCurrentUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data.user);
        
        // Redirect to connect if no vehicle selected
        if (!sessionStorage.getItem('selectedVehicle')) {
          router.push('/connect');
        }
      } catch (err) {
        sessionStorage.removeItem('token');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (vehicleData.isConnected) {
      setHistory(h => [...h.slice(-19), { 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
        level: vehicleData.batteryLevel,
        temp: vehicleData.temperature 
      }]);
    }
  }, [vehicleData]);

  if (!vehicleData.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="p-10 bg-white border border-slate-200 rounded-3xl shadow-sm text-center max-w-md">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-outfit mb-2">No OBD-II Connection</h2>
          <p className="text-slate-500 text-xs leading-relaxed mb-8">
            Please connect your vehicle via Bluetooth to begin live telemetry streaming and Groq AI analysis.
          </p>
          <button 
            onClick={connectVehicle}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            Connect Vehicle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Fleet Overview</h2>
          <p className="text-slate-500 text-xs mt-1">
            Vehicle Status: 
            <span className="font-bold uppercase tracking-wider text-[10px] ml-2 text-green-600">
              ● Operational
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={disconnectVehicle}
            className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <Activity className="w-3.5 h-3.5" />
            Disconnect
          </button>
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">{selectedVehicle?.model || 'Generic EV'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Vehicle Health" 
          value={`${insights?.health_score || vehicleData.healthScore || 0}%`} 
          icon={ShieldCheck} 
          status={insights?.risk_level === 'High' ? 'warning' : 'optimal'} 
        />
        <KpiCard 
          title="Safety Score" 
          value={`${vehicleData.safetyScore || 0}/100`} 
          icon={TrendingUp} 
          status="optimal" 
        />
        <KpiCard 
          title="Battery Level" 
          value={`${vehicleData.batteryLevel}%`} 
          icon={Battery} 
          status={vehicleData.batteryLevel < 20 ? 'warning' : 'optimal'} 
        />
        <KpiCard 
          title="AI Predicted Range" 
          value={`${insights?.predicted_range || 0} km`} 
          icon={Zap} 
          status="optimal" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 auto-card !p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base font-outfit">Performance Profile</h3>
            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>{insights?.behavior || "Analyzing..."} Driving</span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="level" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorLevel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 blur-[50px] rounded-full" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-bold text-sm font-outfit uppercase tracking-wider">Groq Intelligence</h3>
              </div>
              <span className="text-[8px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase">Llama 3.1 70B</span>
            </div>

            <div className="space-y-5 flex-1">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Diagnostic Report</span>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed italic">
                  "{insights?.ai_diagnostic || "Awaiting raw OBD-II telemetry for deep diagnostic sweep..."}"
                </p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">AI Driver Coach</span>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                  "{insights?.coach_advice || "Analyzing driving patterns to provide efficiency optimization..."}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 mt-auto">
                <button 
                  onClick={() => router.push('/history')}
                  className="w-full py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors"
                >
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, status }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-0.5 h-full ${status === 'optimal' ? 'bg-green-500' : 'bg-amber-500'}`} />
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
          <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
        {status === 'optimal' ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-lg font-bold text-slate-900 mt-0.5 font-outfit">{value}</p>
    </div>
  );
}
