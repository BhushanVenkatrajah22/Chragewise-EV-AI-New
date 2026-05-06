"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { Activity, Battery, Zap, ShieldAlert, Navigation, Cpu, LogOut, User } from 'lucide-react';
import LiveDataPanel from '@/components/LiveDataPanel';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import TelemetryCharts from '@/components/TelemetryCharts';
import ConnectButton from '@/components/ConnectButton';

const socket = io('http://localhost:5000');

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [vehicleData, setVehicleData] = useState({
    speed: 0,
    soc: 85,
    temp: 32,
    voltage: 400,
    current: 0
  });

  const [insights, setInsights] = useState({
    range_prediction: 340,
    health_score: 99.2,
    driving_behavior: 'Normal',
    suggestions: 'Optimizing range through steady throttle.'
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));

    socket.on('live_update', (data) => {
      setVehicleData(prev => ({ ...prev, ...data }));
    });

    socket.on('insights', (data) => {
      setInsights(data);
    });

    return () => {
      socket.off('live_update');
      socket.off('insights');
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-10">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Zap className="text-blue-600 w-8 h-8" />
            EV Chargewise <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            Welcome back, <span className="font-semibold text-slate-700">{currentUser.name}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <ConnectButton 
            isConnected={isConnected} 
            setIsConnected={setIsConnected} 
            socket={socket} 
          />
          <button 
            onClick={handleLogout}
            className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <LiveDataPanel data={vehicleData} />
          <TelemetryCharts />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <AIInsightsPanel insights={insights} />
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              System Status
            </h3>
            <div className="space-y-4">
              <StatusItem label="OBD Connection" status={isConnected ? "Active" : "Disconnected"} active={isConnected} />
              <StatusItem label="Node Server" status="Online" active={true} />
              <StatusItem label="FastAPI Engine" status="Healthy" active={true} />
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        &copy; 2026 EV Chargewise AI. Automotive Intelligence Systems.
      </footer>
    </div>
  );
}

function StatusItem({ label, status, active }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-600">{label}</span>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {status}
      </span>
    </div>
  );
}
