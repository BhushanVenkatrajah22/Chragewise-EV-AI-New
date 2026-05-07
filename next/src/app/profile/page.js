"use client";
import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Shield, Car, Settings } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({ 
    name: 'Fleet Manager', 
    email: 'bhushan@chargewise.ai',
    phone: '+91 98765 43210',
    vehicle: 'Model S Plaid'
  });

  const [editForm, setEditForm] = useState({ ...user });

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user_profile');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setEditForm(parsed);
    }
  }, []);

  const handleSave = () => {
    setUser(editForm);
    sessionStorage.setItem('user_profile', JSON.stringify(editForm));
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">User Profile</h2>
        <p className="text-slate-500 text-xs mt-1">Manage your identity and access privileges.</p>
      </div>

      <div className="max-w-xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
            <UserCircle className="w-10 h-10 text-slate-300" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input 
                type="text" 
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full text-xl font-bold text-slate-900 font-outfit bg-slate-50 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 ring-blue-100"
              />
            ) : (
              <h3 className="text-xl font-bold text-slate-900 font-outfit">{user.name}</h3>
            )}
            <p className="text-slate-400 text-xs mt-0.5 font-medium">Enterprise Fleet Administrator</p>
          </div>
        </div>

        <div className="space-y-6">
          <EditableProfileItem 
            icon={Mail} 
            label="Contact Email" 
            value={user.email} 
            isEditing={isEditing}
            editValue={editForm.email}
            onChange={(val) => setEditForm({...editForm, email: val})}
          />
          <EditableProfileItem 
            icon={Shield} 
            label="Phone Number" 
            value={user.phone} 
            isEditing={isEditing}
            editValue={editForm.phone}
            onChange={(val) => setEditForm({...editForm, phone: val})}
          />
          <EditableProfileItem 
            icon={Car} 
            label="Primary Vehicle" 
            value={user.vehicle} 
            isEditing={isEditing}
            editValue={editForm.vehicle}
            onChange={(val) => setEditForm({...editForm, vehicle: val})}
          />
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Save Changes
              </button>
              <button 
                onClick={() => { setIsEditing(false); setEditForm({...user}); }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all"
            >
              Edit Profile Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditableProfileItem({ icon: Icon, label, value, isEditing, editValue, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        {isEditing ? (
          <input 
            type="text" 
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-xs font-bold text-slate-900 mt-1 bg-slate-50 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 ring-blue-100"
          />
        ) : (
          <p className="text-xs font-bold text-slate-900 mt-1">{value}</p>
        )}
      </div>
    </div>
  );
}
