"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ChevronLeft, Zap, Sparkles, Car, Battery, MapPin, Gauge, ShieldCheck, Loader2, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const MANUFACTURERS = [
  "Tata Motors", "MG", "Hyundai", "Mahindra", "BYD", "Kia", "Tesla", "Ather", "Ola Electric", "BMW", "Mercedes-Benz", "Audi", "Volvo", "Porsche"
];

const MODELS = {
  "Tata Motors": ["Nexon EV", "Tiago EV", "Tigor EV", "Punch EV", "Curvv EV"],
  "MG": ["ZS EV", "Comet EV", "Windsor EV"],
  "Hyundai": ["IONIQ 5", "Kona Electric"],
  "Mahindra": ["XUV400"],
  "BYD": ["Atto 3", "Seal", "e6"],
  "Kia": ["EV6", "EV9"],
  "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
  "Ather": ["450X", "450S", "Rizta"],
  "Ola Electric": ["S1 Pro", "S1 Air", "S1 X"]
};

export default function VehicleConfigForm({ bluetoothDevice, onSuccess, onCancel }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    variant: '',
    specs: {
      batteryCapacity: 0,
      batteryVoltage: 0,
      chargingVoltage: 0,
      maxChargingSpeed: 0,
      claimedRange: 0,
      realWorldRange: 0,
      motorPower: 0,
      torque: 0,
      topSpeed: 0,
      coolingType: '',
      weight: 0,
      year: new Date().getFullYear(),
      batteryChemistry: ''
    }
  });

  const [aiStatus, setAiStatus] = useState('');

  const fetchAiSpecs = async () => {
    if (!formData.manufacturer || !formData.model || !formData.variant) return;
    
    setLoading(true);
    setAiStatus('Groq AI is fetching technical specifications...');
    
    try {
      const response = await axios.post('http://localhost:8000/fetch-specs', {
        manufacturer: formData.manufacturer,
        model: formData.model,
        variant: formData.variant
      });
      
      setFormData(prev => ({
        ...prev,
        specs: { ...prev.specs, ...response.data }
      }));
      setAiStatus('Specifications synchronized successfully.');
      setTimeout(() => setAiStatus(''), 3000);
    } catch (err) {
      console.error('AI Fetch Error:', err);
      setAiStatus('AI Sync failed. Server might be offline. Please enter specs manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/vehicles', {
        ...formData,
        bluetoothId: bluetoothDevice?.id,
        deviceName: bluetoothDevice?.name
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess(response.data);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save vehicle profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-outfit">Configure Vehicle</h2>
          <p className="text-slate-500 text-sm mt-1">
            Bluetooth connected: <span className="text-blue-600 font-bold">{bluetoothDevice?.name || 'Unknown Bridge'}</span>
          </p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Steps Indicator */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-slate-100'}`} 
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Manufacturer</label>
                <select 
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value, model: '' })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900 appearance-none"
                >
                  <option value="">Select Manufacturer</option>
                  {MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="Other">Other (Custom Entry)</option>
                </select>
              </div>

              {formData.manufacturer === 'Other' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Custom Manufacturer</label>
                  <input 
                    type="text"
                    placeholder="Enter Manufacturer Name"
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900"
                  />
                </motion.div>
              )}

              {formData.manufacturer && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Model</label>
                  <select 
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900 appearance-none"
                  >
                    <option value="">Select Model</option>
                    {(MODELS[formData.manufacturer] || []).map(m => <option key={m} value={m}>{m}</option>)}
                    <option value="Other">Other (Custom Entry)</option>
                  </select>
                </div>
              )}

              {formData.model === 'Other' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Custom Model</label>
                  <input 
                    type="text"
                    placeholder="Enter Model Name"
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900"
                  />
                </motion.div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Variant / Trim</label>
                <input 
                  type="text"
                  placeholder="e.g. Max Lux, LR AWD, Performance"
                  value={formData.variant}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <button
              onClick={() => { fetchAiSpecs(); setStep(2); }}
              disabled={!formData.manufacturer || !formData.model || !formData.variant}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              Continue to AI Analysis <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-600/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl font-outfit">AI Specification Sync</h3>
                  <p className="text-blue-100 text-xs">Llama 3.1 70B is analyzing {formData.model} {formData.variant}</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">{aiStatus}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white" 
                      animate={{ x: [-100, 300] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }} 
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{aiStatus || 'AI data successfully mapped to profile.'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <ReadOnlySpec icon={Battery} label="Battery" value={`${formData.specs.batteryCapacity} kWh`} />
               <ReadOnlySpec icon={Zap} label="Voltage" value={`${formData.specs.batteryVoltage} V`} />
               <ReadOnlySpec icon={MapPin} label="Range" value={`${formData.specs.claimedRange} km`} />
               <ReadOnlySpec icon={Gauge} label="Top Speed" value={`${formData.specs.topSpeed} km/h`} />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 border border-slate-200 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                Refine Technical Details <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
              <EditableField 
                label="Battery Capacity (kWh)" 
                value={formData.specs.batteryCapacity} 
                onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, batteryCapacity: parseFloat(v) }})} 
              />
              <EditableField 
                label="Nominal Voltage (V)" 
                value={formData.specs.batteryVoltage} 
                onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, batteryVoltage: parseFloat(v) }})} 
              />
              <EditableField 
                label="Max Charging Speed (kW)" 
                value={formData.specs.maxChargingSpeed} 
                onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, maxChargingSpeed: parseFloat(v) }})} 
              />
              <EditableField 
                label="Claimed Range (km)" 
                value={formData.specs.claimedRange} 
                onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, claimedRange: parseFloat(v) }})} 
              />
              <EditableField 
                label="Real-World Range (km)" 
                value={formData.specs.realWorldRange} 
                onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, realWorldRange: parseFloat(v) }})} 
              />
              <EditableField 
                label="Motor Power (kW)" 
                value={formData.specs.motorPower} 
                onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, motorPower: parseFloat(v) }})} 
              />
              <EditableField 
                label="Battery Chemistry" 
                value={formData.specs.batteryChemistry} 
                type="text"
                onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, batteryChemistry: v }})} 
              />
              <EditableField 
                label="Cooling Type" 
                value={formData.specs.coolingType} 
                type="text"
                onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, coolingType: v }})} 
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-4 border border-slate-200 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Finalize & Save Vehicle
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReadOnlySpec({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
      <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, type = "number" }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900 text-sm"
      />
    </div>
  );
}
