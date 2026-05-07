"use client";
import React, { useState } from 'react';
import { Settings, Shield, Bell, Cloud, Database } from 'lucide-react';

export default function SettingsPage() {
  const [notifs, setNotifs] = useState({
    temp: true,
    charge: true,
    maint: true
  });

  const [security, setSecurity] = useState({
    obd: true,
    bio: false,
    cloud: true
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Vehicle Settings</h2>
        <p className="text-slate-500 text-xs mt-1">Configure telemetry thresholds and AI sensitivity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2"><Bell className="w-4 h-4 text-blue-600"/> Notifications</h3>
          <div className="space-y-4">
            <ToggleItem 
              label="Critical Temperature Alerts" 
              active={notifs.temp} 
              onToggle={() => setNotifs(prev => ({ ...prev, temp: !prev.temp }))} 
            />
            <ToggleItem 
              label="Charge Completion Updates" 
              active={notifs.charge} 
              onToggle={() => setNotifs(prev => ({ ...prev, charge: !prev.charge }))} 
            />
            <ToggleItem 
              label="Predictive Maintenance" 
              active={notifs.maint} 
              onToggle={() => setNotifs(prev => ({ ...prev, maint: !prev.maint }))} 
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600"/> Security</h3>
          <div className="space-y-4">
            <ToggleItem 
              label="Enable OBD Connection" 
              active={security.obd} 
              onToggle={() => setSecurity(prev => ({ ...prev, obd: !prev.obd }))} 
            />
            <ToggleItem 
              label="Biometric Session Lock" 
              active={security.bio} 
              onToggle={() => setSecurity(prev => ({ ...prev, bio: !prev.bio }))} 
            />
            <ToggleItem 
              label="Cloud Sync Logs" 
              active={security.cloud} 
              onToggle={() => setSecurity(prev => ({ ...prev, cloud: !prev.cloud }))} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ label, active, onToggle }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <button 
        onClick={onToggle}
        className={`w-9 h-5 rounded-full relative transition-colors outline-none ${active ? 'bg-blue-600' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-5' : 'left-1'}`} />
      </button>
    </div>
  );
}
