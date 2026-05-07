"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Bluetooth, Car, ArrowRight, ShieldCheck, Zap, Activity, Info, AlertTriangle, CheckCircle2, Search, X, Loader2, Edit3, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useEVData } from '@/context/EVDataContext';
import VehicleConfigForm from '@/components/VehicleConfigForm';

export default function ConnectPage() {
  const [vehicles, setVehicles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBluetoothDevice, setSelectedBluetoothDevice] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { selectVehicle } = useEVData();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not sync with the vehicle network. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const RadarAnimation = () => (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
        className="absolute inset-0 border-2 border-blue-500 rounded-full"
      />
      <motion.div 
        animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
        className="absolute inset-0 border-2 border-blue-400 rounded-full"
      />
      <div className="relative w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/40 z-10">
        <Bluetooth className="w-12 h-12 text-white animate-pulse" />
      </div>
      <div className="absolute inset-0 border border-slate-200 rounded-full opacity-20" />
    </div>
  );

  const startBluetoothScan = async () => {
    setIsScanning(true);
    setError('');
    
    try {
      // Use Web Bluetooth API
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth is not supported in this browser environment. Please use Chrome or Edge.');
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'] // Common service for detection
      });

      console.log('Device selected:', device.name);
      setSelectedBluetoothDevice({
        id: device.id,
        name: device.name || 'Unknown Device'
      });
      
      // If an OBD device name is matched (common prefixes)
      const isOBD = device.name?.toLowerCase().includes('obd') || device.name?.toLowerCase().includes('elm327');
      
      setShowConfig(true);
    } catch (err) {
      console.error('Bluetooth Error:', err);
      if (err.name !== 'NotFoundError' && err.name !== 'SecurityError') {
        setError(err.message || 'Bluetooth initialization failed. Ensure you are using HTTPS or localhost.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    selectVehicle(vehicle);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Zap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-outfit">EV Intelligence</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Connection Hub</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.clear(); router.push('/login'); }}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            Terminal Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 font-outfit mb-2">Select Active Vehicle</h2>
          <p className="text-slate-500 max-w-md mx-auto">Choose a saved vehicle profile or connect to a new OBD-II bridge to begin telemetry analysis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Vehicle Button */}
          <motion.button
            whileHover={{ y: -5 }}
            onClick={startBluetoothScan}
            disabled={isScanning}
            className="h-[220px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50 transition-all group overflow-hidden relative"
          >
            {isScanning ? (
              <div className="scale-50 opacity-40">
                <RadarAnimation />
              </div>
            ) : (
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Plus className="w-8 h-8" />
              </div>
            )}
            <div className="text-center z-10">
              <p className="font-bold text-slate-900">{isScanning ? "Initializing Scanner..." : "Connect New Device"}</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
                {isScanning ? "Check browser popup" : "Bluetooth OBD-II / Phone"}
              </p>
            </div>
          </motion.button>

          {/* Vehicle Cards */}
          {vehicles.map((vehicle) => (
            <motion.div
              key={vehicle._id}
              whileHover={{ y: -5 }}
              onClick={() => handleVehicleSelect(vehicle)}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
            >
              {/* Card Controls & Badge */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={async (e) => { 
                      e.stopPropagation(); 
                      if(confirm('Delete this vehicle profile?')) {
                        await axios.delete(`http://localhost:5000/vehicles/${vehicle._id}`, {
                          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        });
                        fetchVehicles();
                      }
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  {vehicle.variant}
                </span>
              </div>

              {/* Large Image Showcase */}
              <div className="w-full h-32 bg-slate-50/50 rounded-3xl flex items-center justify-center overflow-hidden border border-slate-100 group-hover:border-blue-100 transition-all mb-8 relative">
                {(() => {
                  const mName = vehicle.manufacturer.toLowerCase().split(' ')[0];
                  const modelName = vehicle.model.toLowerCase().replace(/\s+/g, '-');
                  const localPath = `/vehicles/${mName}-${modelName}.png`;
                  
                  return (
                    <>
                      <img 
                        src={localPath} 
                        alt={vehicle.model} 
                        className="w-full h-full object-contain p-2 relative z-10 transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden items-center justify-center w-full h-full text-slate-200 transition-colors">
                        <Car className="w-12 h-12" />
                      </div>
                    </>
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 font-outfit">{vehicle.model}</h3>
                <p className="text-sm text-slate-500 font-medium">{vehicle.manufacturer}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacity</p>
                  <p className="text-sm font-bold text-slate-900">{vehicle.specs?.batteryCapacity} kWh</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Range</p>
                  <p className="text-sm font-bold text-slate-900">{vehicle.specs?.claimedRange} km</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl max-w-lg mx-auto text-center"
            >
              <p className="text-sm font-bold text-blue-900 mb-2">Discovery Tips</p>
              <ul className="text-xs text-blue-600 space-y-1.5 font-medium">
                <li>• Ensure your phone is on the "Bluetooth Settings" page</li>
                <li>• Verify OBD-II scanner is powered and nearby</li>
                <li>• Grant browser permission in the top popup</li>
              </ul>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-12 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium max-w-lg mx-auto"
            >
              <AlertTriangle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowConfig(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <VehicleConfigForm 
                bluetoothDevice={selectedBluetoothDevice} 
                onSuccess={(newVehicle) => {
                  setVehicles([...vehicles, newVehicle]);
                  setShowConfig(false);
                }}
                onCancel={() => setShowConfig(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="mt-12 text-center pb-12">
        <div className="flex justify-center items-center gap-6 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Secure Pairing</span>
          <span className="w-1 h-1 bg-slate-200 rounded-full" />
          <span>OBD-II Certified</span>
        </div>
      </footer>
    </div>
  );
}
