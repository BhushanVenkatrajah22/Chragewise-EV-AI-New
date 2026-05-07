"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Bluetooth, Car, ArrowRight, ShieldCheck, Zap, Activity, Info, AlertTriangle, CheckCircle2, Search, X, Loader2, Edit3, Trash2, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { useEVData } from '@/context/EVDataContext';
import VehicleConfigForm from '@/components/VehicleConfigForm';

export default function ConnectPage() {
  const [vehicles, setVehicles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
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
      const token = sessionStorage.getItem('token');
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
            <div className="w-11 h-11 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-outfit">EV Intelligence</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Connection Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { sessionStorage.clear(); router.push('/login'); }}
              className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Terminal Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 font-outfit tracking-tight">Active Vehicle Selection</h2>
          <p className="text-slate-500 text-xs mt-1">Select a fleet vehicle to monitor telemetry or pair a new OBD-II unit.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Add Vehicle Button */}
          <button
            onClick={startBluetoothScan}
            disabled={isScanning}
            className="min-h-[240px] h-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            {isScanning ? (
              <div className="scale-50">
                <RadarAnimation />
              </div>
            ) : (
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                <Plus className="w-6 h-6" />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">Add New Vehicle</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Bluetooth OBD-II</p>
            </div>
          </button>

          {/* Vehicle Cards */}
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              onClick={() => handleVehicleSelect(vehicle)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition-all cursor-pointer group flex flex-col min-h-[240px] h-full"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setVehicleToEdit(vehicle);
                      setShowConfig(true);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setVehicleToDelete(vehicle);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-end max-w-[60%]">
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest border border-slate-200 truncate">
                    {vehicle.variant}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center mb-3">
                {(() => {
                  const mName = vehicle.manufacturer.toLowerCase().split(' ')[0];
                  let modelName = vehicle.model.toLowerCase().replace(/\s+/g, '-');
                  
                  // Clean up duplicate prefixes if the model name already includes the manufacturer
                  if (modelName.startsWith(`${mName}-`)) {
                    modelName = modelName.substring(mName.length + 1);
                  }
                  
                  const localPath = `/vehicles/${mName}-${modelName}.png`;
                  
                  return (
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100 group-hover:border-blue-100 transition-colors">
                      <img 
                        src={localPath} 
                        alt={vehicle.model} 
                        className="w-full h-full object-contain p-2 pb-8 relative z-10 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden items-center justify-center w-full h-full text-slate-200">
                        <Car className="w-8 h-8" />
                      </div>

                      {/* Embedded Specs */}
                      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] z-20 pointer-events-none">
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">Power</p>
                        <p className="text-[10px] font-black text-slate-900 mt-0.5 leading-none">{vehicle.specs?.batteryCapacity} kWh</p>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] z-20 pointer-events-none text-right">
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">Range</p>
                        <p className="text-[10px] font-black text-slate-900 mt-0.5 leading-none">{vehicle.specs?.claimedRange} km</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              <div className="mt-2 mb-1 text-center">
                <h3 className="text-sm font-bold text-slate-900 font-outfit leading-tight truncate">{vehicle.model}</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">{vehicle.manufacturer}</p>
              </div>
            </div>
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <VehicleConfigForm 
                bluetoothDevice={selectedBluetoothDevice}
                initialData={vehicleToEdit}
                onSuccess={(newVehicle) => {
                  setShowConfig(false);
                  setVehicleToEdit(null);
                  fetchVehicles();
                  // Optionally auto-select new vehicle
                  if (!vehicleToEdit) {
                    handleVehicleSelect(newVehicle);
                  }
                }}
                onCancel={() => {
                  setShowConfig(false);
                  setVehicleToEdit(null);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {vehicleToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-outfit mb-2">Delete Vehicle Profile?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to permanently remove the <span className="font-bold text-slate-700">{vehicleToDelete.manufacturer} {vehicleToDelete.model}</span>? This will wipe all associated telemetry history.
              </p>
              
              <AnimatePresence>
                {deleteError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-lg mb-4 text-center border border-red-100">
                    {deleteError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setVehicleToDelete(null);
                    setDeleteError('');
                  }}
                  className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setDeleteError('');
                    try {
                      await axios.delete(`http://localhost:5000/vehicles/${vehicleToDelete._id}`, {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                      });
                      setVehicleToDelete(null);
                      fetchVehicles();
                    } catch (err) {
                      setDeleteError('Failed to connect to the server. Please try again.');
                    }
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Delete Profile
                </button>
              </div>
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
