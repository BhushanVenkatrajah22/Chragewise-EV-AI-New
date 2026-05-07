"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ChevronLeft, Zap, Sparkles, Car, Battery, MapPin, Gauge, ShieldCheck, Loader2, X, CheckCircle2, Bluetooth, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const MANUFACTURERS = [
  "Tata Motors", "MG", "Hyundai", "Mahindra", "BYD", "Kia", "Tesla", "Ather", "Ola Electric", "BMW", "Mercedes-Benz", "Audi", "Volvo", "Porsche"
];

const MODELS = {
  "Tata Motors": ["Tata Nexon EV", "Tata Tiago EV", "Tata Tigor EV", "Tata Punch EV", "Tata Curvv EV"],
  "MG": ["MG ZS EV", "MG Comet EV", "MG Windsor EV"],
  "Hyundai": ["Hyundai IONIQ 5", "Hyundai Kona Electric", "Hyundai Creta EV"],
  "Mahindra": ["Mahindra XUV400"],
  "BYD": ["BYD Atto 3", "BYD Seal", "BYD e6"],
  "Kia": ["Kia EV6", "Kia EV9"],
  "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
  "Ather": ["450X", "450S", "Rizta"],
  "Ola Electric": ["S1 Pro", "S1 Air", "S1 X"]
};

export default function VehicleConfigForm({ bluetoothDevice, onSuccess, onCancel, initialData }) {
  const [step, setStep] = useState(initialData ? 3 : 1);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState(initialData || {
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
  const [aiModels, setAiModels] = useState([]);
  const [aiVariants, setAiVariants] = useState([]);
  const [isFetchingOptions, setIsFetchingOptions] = useState(false);

  const fetchOptions = async (manufacturer, model = null) => {
    setIsFetchingOptions(true);
    try {
      const response = await axios.post('http://localhost:8000/fetch-options', {
        manufacturer,
        model
      });
      if (model) {
        setAiVariants(response.data || []);
      } else {
        setAiModels(response.data || []);
        setAiVariants([]); // Reset variants when manufacturer changes
      }
    } catch (err) {
      console.error('Fetch Options Error:', err);
    } finally {
      setIsFetchingOptions(false);
    }
  };

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
    setSaveError('');
    try {
      const token = sessionStorage.getItem('token');
      const payload = {
        ...formData,
        bluetoothId: bluetoothDevice?.id || formData.bluetoothId,
        deviceName: bluetoothDevice?.name || formData.deviceName
      };
      
      let response;
      if (formData._id) {
        response = await axios.put(`http://localhost:5000/vehicles/${formData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.post('http://localhost:5000/vehicles', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess(response.data);
    } catch (err) {
      console.error('Save error:', err);
      setSaveError(err.response?.data?.error || 'Failed to save vehicle profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-xl max-w-2xl w-full">
      {/* Standard Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-outfit">{initialData ? 'Edit Vehicle Profile' : 'Vehicle Configuration'}</h2>
          <p className="text-slate-500 text-[10px] mt-0.5">
            OBD-II Bridge: <span className="text-blue-600 font-bold">{bluetoothDevice?.name || formData.deviceName || 'Local Simulator'}</span>
          </p>
        </div>
        <button onClick={onCancel} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {saveError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">Operation Failed</p>
              <p className="text-xs text-red-600 mt-0.5">{saveError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        {/* Step Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-blue-600' : 'bg-slate-100'}`} />
            </div>
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
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Manufacturer</label>
                <select 
                  value={formData.manufacturer}
                  onChange={(e) => {
                    const m = e.target.value;
                    setFormData({ ...formData, manufacturer: m, model: '', variant: '' });
                    if (m && m !== 'Other') fetchOptions(m);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900 text-sm"
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block flex items-center justify-between">
                    Model 
                    {isFetchingOptions && !formData.model && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                  </label>
                  <select 
                    value={formData.model}
                    onChange={(e) => {
                      const m = e.target.value;
                      setFormData({ ...formData, model: m, variant: '' });
                      if (m && m !== 'Other') fetchOptions(formData.manufacturer, m);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900 text-sm"
                  >
                    <option value="">Select Model</option>
                    {[...new Set([...(MODELS[formData.manufacturer] || []), ...aiModels])].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="Other">Other (Custom Entry)</option>
                  </select>
                </div>
              )}

              {formData.model === 'Other' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Custom Model</label>
                  <input 
                    type="text"
                    placeholder="Enter Model Name"
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block flex items-center justify-between">
                  Variant / Trim
                  {isFetchingOptions && formData.model && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                </label>
                {aiVariants.length > 0 ? (
                  <select 
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900 text-sm"
                  >
                    <option value="">Select Variant</option>
                    {aiVariants.map(v => <option key={v} value={v}>{v}</option>)}
                    <option value="custom">Enter Custom Variant...</option>
                  </select>
                ) : (
                  <input 
                    type="text"
                    placeholder="e.g. Max Lux, LR AWD"
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900 text-sm"
                  />
                )}
              </div>

              {formData.variant === 'custom' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Custom Variant</label>
                  <input 
                    type="text"
                    placeholder="Enter Variant Name"
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-900 text-sm"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => { fetchAiSpecs(); setStep(2); }}
              disabled={!formData.manufacturer || !formData.model || !formData.variant}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              Fetch AI Specs
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
              <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg font-outfit text-slate-900">AI Specification Sync</h3>
              <p className="text-slate-500 text-xs mt-1">Analyzing {formData.model} {formData.variant}</p>
              
              <div className="mt-4">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    {aiStatus}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    {aiStatus || 'AI mapping complete.'}
                  </div>
                )}
              </div>
            </div>

           <div className="grid grid-cols-2 gap-3">
               <ReadOnlySpec icon={Battery} label="Battery" value={`${formData.specs.batteryCapacity} kWh`} />
               <ReadOnlySpec icon={Zap} label="Voltage" value={`${formData.specs.batteryVoltage} V`} />
               <ReadOnlySpec icon={MapPin} label="Range" value={`${formData.specs.claimedRange} km`} />
               <ReadOnlySpec icon={Gauge} label="Top Speed" value={`${formData.specs.topSpeed} km/h`} />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all"
              >
                Review Details
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
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
              <EditableField label="Battery Cap (kWh)" value={formData.specs.batteryCapacity} onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, batteryCapacity: parseFloat(v) }})} />
              <EditableField label="Voltage (V)" value={formData.specs.batteryVoltage} onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, batteryVoltage: parseFloat(v) }})} />
              <EditableField label="Charge Speed (kW)" value={formData.specs.maxChargingSpeed} onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, maxChargingSpeed: parseFloat(v) }})} />
              <EditableField label="Claimed Range" value={formData.specs.claimedRange} onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, claimedRange: parseFloat(v) }})} />
              <EditableField label="Real Range" value={formData.specs.realWorldRange} onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, realWorldRange: parseFloat(v) }})} />
              <EditableField label="Motor (kW)" value={formData.specs.motorPower} onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, motorPower: parseFloat(v) }})} />
              <EditableField label="Chemistry" value={formData.specs.batteryChemistry} type="text" onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, batteryChemistry: v }})} />
              <EditableField label="Cooling" value={formData.specs.coolingType} type="text" onChange={(v) => setFormData({ ...formData, specs: { ...formData.specs, coolingType: v }})} />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Save Profile
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReadOnlySpec({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
      <div className="p-1.5 bg-white rounded-md text-blue-600 shadow-sm">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xs font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, type = "number" }) {
  return (
    <div>
      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:border-blue-500 text-sm"
      />
    </div>
  );
}
