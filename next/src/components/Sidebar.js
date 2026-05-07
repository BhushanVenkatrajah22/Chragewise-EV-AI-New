"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BatteryCharging, 
  Thermometer, 
  Zap, 
  Activity, 
  Timer, 
  Car, 
  BrainCircuit, 
  Wrench, 
  BarChart3, 
  AlertTriangle, 
  History, 
  Settings, 
  UserCircle,
  LogOut,
  CarFront,
  Bluetooth
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Battery Analytics', icon: BatteryCharging, path: '/battery' },
  { name: 'Temperature', icon: Thermometer, path: '/temperature' },
  { name: 'Voltage Monitoring', icon: Zap, path: '/voltage' },
  { name: 'Current Monitoring', icon: Activity, path: '/current' },
  { name: 'Charging Analytics', icon: Timer, path: '/charging' },
  { name: 'Driving Behavior', icon: Car, path: '/driving' },
  { name: 'AI Insights', icon: BrainCircuit, path: '/ai-insights' },
  { name: 'Predictive Maintenance', icon: Wrench, path: '/maintenance' },
  { name: 'Vehicle Health', icon: BarChart3, path: '/health' },
  { name: 'Alerts & Risks', icon: AlertTriangle, path: '/alerts' },
  { name: 'Data History', icon: History, path: '/history' },
  { name: 'Vehicle Settings', icon: Settings, path: '/settings' },
  { name: 'User Profile', icon: UserCircle, path: '/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <CarFront className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 leading-tight text-sm">Chargewise</h1>
          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block">AI Intelligence</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-xs font-medium ${
                isActive 
                ? 'bg-blue-50 text-blue-600 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-1">
        <Link 
          href="/connect"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
        >
          <Bluetooth className="w-4 h-4" />
          <span>Switch Vehicle</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect Session</span>
        </button>
      </div>
    </aside>
  );
}
