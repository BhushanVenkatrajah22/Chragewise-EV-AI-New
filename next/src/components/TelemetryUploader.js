"use client";
import React, { useRef } from 'react';
import { UploadCloud, AlertTriangle, Pause, Play } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useEVData } from '@/context/EVDataContext';

export default function TelemetryUploader() {
  const { 
    startSimulation, 
    selectedVehicle, 
    setToastMessage,
    simulationMap,
    pauseSimulation,
    resumeSimulation
  } = useEVData();
  const inputRef = useRef(null);

  const simStatus = selectedVehicle ? (simulationMap[selectedVehicle._id]?.status || 'idle') : 'idle';

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Guard: must have a vehicle selected first
    if (!selectedVehicle?._id) {
      alert('Please select a vehicle on the Connect page before uploading telemetry data.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      if (!data.length) {
        alert('The uploaded file appears to be empty or incorrectly formatted.');
        return;
      }

      // Start isolated simulation for THIS vehicle only
      startSimulation(data, selectedVehicle._id);
    };
    reader.readAsBinaryString(file);

    // Reset input so same file can be re-uploaded
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleToggleSimulation = (e) => {
    e.preventDefault();
    if (!selectedVehicle?._id) return;

    if (simStatus === 'processing') {
      pauseSimulation(selectedVehicle._id);
      setToastMessage('⏸ Simulation Paused');
      setTimeout(() => setToastMessage(''), 3000);
    } else if (simStatus === 'paused') {
      resumeSimulation(selectedVehicle._id);
      setToastMessage('▶ Simulation Resumed');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label
        className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm border border-slate-200 cursor-pointer group"
        title={selectedVehicle ? `Upload telemetry for ${selectedVehicle.model}` : 'Select a vehicle first'}
      >
        <UploadCloud className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        {selectedVehicle
          ? `Upload — ${selectedVehicle.model}`
          : 'Upload Data'}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>

      {(simStatus === 'processing' || simStatus === 'paused') && (
        <button
          onClick={handleToggleSimulation}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm border ${
            simStatus === 'processing' 
              ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
          }`}
        >
          {simStatus === 'processing' ? (
            <>
              <Pause className="w-4 h-4" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          )}
        </button>
      )}
    </div>
  );
}
