"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const EVDataContext = createContext();

const EMPTY_DATA = {
  batteryLevel: 0, temperature: 0, voltage: 0, current: 0,
  speed: 0, range: 0, healthScore: 0, safetyScore: 0,
  efficiency: 0, isConnected: false
};

export function EVDataProvider({ children }) {
  // simulationMap: { [vehicleId]: { data: {...}, insights: {...}, datasetIndex: 0, status: 'idle', fullData: [] } }
  const [simulationMap, setSimulationMap] = useState({});
  const intervalRefs = useRef({}); // stores setInterval IDs per vehicleId

  const [socket, setSocket]               = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [toastMessage, setToastMessage]   = useState('');

  // ── Derived read-only values for the currently selected vehicle ──────────
  const activeVehicleId = selectedVehicle?._id;
  const vehicleData = (simulationMap[activeVehicleId]?.data) ?? EMPTY_DATA;
  const insights    = (simulationMap[activeVehicleId]?.insights) ?? null;

  // ── Load selected vehicle from localStorage on mount ─────────────────────
  useEffect(() => {
    const savedVehicle = localStorage.getItem('selectedVehicle');
    if (savedVehicle) {
      setSelectedVehicle(JSON.parse(savedVehicle));
    }
  }, []);

  const selectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    localStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
  };

  // ── Per-Vehicle Simulation Engine ─────────────────────────────────────────
  const startSimulation = (dataArray, vehicleId, startIndex = 0) => {
    if (!dataArray?.length || !vehicleId) return;

    // Clear any existing interval for THIS vehicle only
    if (intervalRefs.current[vehicleId]) {
      clearInterval(intervalRefs.current[vehicleId]);
    }

    let currentIndex = startIndex;
    const totalSets = dataArray.length;
    const token = localStorage.getItem('token');

    const applyRow = async (row, index) => {
      const newData = {
        isConnected: true,
        batteryLevel:  parseFloat(row['State of Charge (SoC)'])        || 0,
        healthScore:   parseFloat(row['State of Health (SoH)'])        || 0,
        voltage:       parseFloat(row['Total Pack Voltage'])            || 0,
        current:       parseFloat(row['Instantaneous Current'])         || 0,
        temperature:   parseFloat(row['Battery Temperature Avg'])       || 0,
        speed:         parseFloat(row['Vehicle Speed'])                 || 0,
        range:         parseFloat(row['Predicted Remaining Range'])     || 0,
        efficiency:    parseFloat(row['Real-Time Efficiency'])          || 0,
        // Extended fields for feature pages
        soh:           parseFloat(row['State of Health (SoH)'])        || 0,
        minCellV:      parseFloat(row['Min Cell Voltage'])              || 0,
        maxCellV:      parseFloat(row['Max Cell Voltage'])              || 0,
        cellDelta:     parseFloat(row['Cell Voltage Delta'])            || 0,
        maxBattTemp:   parseFloat(row['Max Battery Temperature'])       || 0,
        motorTemp:     parseFloat(row['Motor Temperature'])             || 0,
        inverterTemp:  parseFloat(row['Inverter Temperature'])          || 0,
        accelPos:      parseFloat(row['Accelerator Pedal Position'])    || 0,
        brakePos:      parseFloat(row['Brake Pedal Position'])          || 0,
        regenPower:    parseFloat(row['Regenerative Braking Power'])    || 0,
        odometer:      parseFloat(row['Odometer'])                      || 0,
        chargingStatus: String(row['Charging Status']).toUpperCase() === 'TRUE',
        plugConnected:  String(row['Plug Connected']).toUpperCase()  === 'TRUE',
        maxChargeCurrent: parseFloat(row['Max Allowed Charge Current']) || 0,
        chargingPower:  parseFloat(row['Current Charging Power'])       || 0,
        aiDrivingScore: parseFloat(row['AI Driving Score'])            || 0,
        aiThermalRisk:  parseFloat(row['AI Thermal Risk Score'])        || 0,
        aiBattDegRisk:  parseFloat(row['AI Battery Degradation Risk']) || 0,
        aiHealth:       parseFloat(row['AI Overall Vehicle Health'])    || 0,
      };

      let newInsights = {
        behavior:     row['AI Driving Score'] ? `Score: ${row['AI Driving Score']}/100` : 'Analyzing...',
        maintenance:  row['AI Maintenance Prediction'] || 'Analyzing...',
        efficiency:   `${row['Real-Time Efficiency'] || 0} Wh/km`,
        risk_level:   'Calculating...',
        health_score: parseFloat(row['AI Overall Vehicle Health']) || 100,
        ai_diagnostic: 'Analyzing systems...',
        coach_advice:  'Analyzing driving patterns...',
        predicted_range: parseFloat(row['Predicted Remaining Range']) || 0,
      };

      // ── Groq AI Analysis ──────────────────────────────────────────────────
      try {
        const aiResponse = await axios.post('http://localhost:8000/analyze', {
          vehicleId: vehicleId,
          manufacturer: selectedVehicle?.manufacturer || 'Generic',
          model: selectedVehicle?.model || 'EV',
          variant: selectedVehicle?.variant || 'Base',
          specs: selectedVehicle?.specs || {},
          speed: newData.speed,
          soc: newData.batteryLevel,
          voltage: newData.voltage,
          current: newData.current,
          temperature: newData.temperature,
          acceleration: newData.accelPos || 0.0
        });

        if (aiResponse.data) {
          const ai = aiResponse.data;
          newInsights = {
            ...newInsights,
            behavior:      ai.behavior || newInsights.behavior,
            maintenance:   ai.ai_diagnostic || newInsights.maintenance,
            risk_level:    ai.risk_level || 'Low',
            health_score:  ai.health_score || newInsights.health_score,
            ai_diagnostic: ai.ai_diagnostic || newInsights.ai_diagnostic,
            coach_advice:  ai.coach_advice || newInsights.coach_advice,
            predicted_range: ai.predicted_range || newInsights.predicted_range,
          };
        }
      } catch (err) {
        console.error('Groq AI Analysis Error:', err);
        // Fallback to minimal data if AI fails
        newInsights.ai_diagnostic = "AI Intelligence Offline. Using local heuristics.";
      }

      // Update only THIS vehicle's slice of the map
      setSimulationMap(prev => ({
        ...prev,
        [vehicleId]: {
          ...prev[vehicleId],
          data: newData,
          insights: newInsights,
          datasetIndex: index,
          fullData: dataArray,
          status: index >= totalSets - 1 ? 'completed' : 'processing'
        }
      }));

      // Persist to database (fire-and-forget, non-blocking)
      if (token) {
        axios.post(`http://localhost:5000/telemetry/${vehicleId}`, {
          datasetIndex: index,
          soc: newData.batteryLevel,
          soh: newData.soh,
          voltage: newData.voltage,
          current: newData.current,
          batteryTempAvg: newData.temperature,
          speed: newData.speed,
          predictedRange: newData.range,
          efficiency: newData.efficiency,
          aiDrivingScore: newData.aiDrivingScore,
          aiThermalRisk: newData.aiThermalRisk,
          aiBatteryDegRisk: newData.aiBattDegRisk,
          aiHealthScore: newData.aiHealth,
          aiMaintenancePred: newInsights.maintenance,
        }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});

        // ── Risk Alert Notification ──────────────────────────────────────────
        if (newInsights.risk_level && newInsights.risk_level.toLowerCase() !== 'low') {
          axios.post(`http://localhost:5000/telemetry/${vehicleId}/alert`, {
            riskData: {
              vehicleName: selectedVehicle?.model || 'EV Unit',
              riskLevel: newInsights.risk_level,
              speed: newData.speed,
              soc: newData.batteryLevel,
              diagnostic: newInsights.ai_diagnostic,
              voltage: newData.voltage,
              current: newData.current,
              temp: newData.temperature,
              maxTemp: newData.maxBattTemp,
              efficiency: newData.efficiency,
              drivingScore: newData.aiDrivingScore
            }
          }, { headers: { Authorization: `Bearer ${token}` } }).catch(err => console.error('Alert Trigger Error:', err));
        }
      }

      // Toast shown only if this is the actively viewed vehicle
      const vName = selectedVehicle?._id === vehicleId
        ? (selectedVehicle?.model || 'Vehicle')
        : null;
      if (vName) {
        setToastMessage(`✅ ${vName} — Telemetry Refreshed (${index + 1}/${totalSets})`);
        setTimeout(() => setToastMessage(''), 4000);
      }
    };

    // Apply first row immediately
    applyRow(dataArray[0], 0);

    // Schedule remaining rows on 45-second ticks
    const id = setInterval(() => {
      currentIndex++;
      if (currentIndex >= totalSets) {
        clearInterval(id);
        delete intervalRefs.current[vehicleId];
        const vName = selectedVehicle?._id === vehicleId
          ? (selectedVehicle?.model || 'Vehicle') : 'Vehicle';
        setToastMessage(`🛑 ${vName} — Simulation Complete. Locked on Final Dataset.`);
        setTimeout(() => setToastMessage(''), 5000);
        return;
      }
      applyRow(dataArray[currentIndex], currentIndex);
    }, 45000);

    intervalRefs.current[vehicleId] = id;
  };

  // ── Stop/Pause/Resume simulation for a specific vehicle ──────────────────
  const stopSimulation = (vehicleId) => {
    if (intervalRefs.current[vehicleId]) {
      clearInterval(intervalRefs.current[vehicleId]);
      delete intervalRefs.current[vehicleId];
    }
  };

  const pauseSimulation = (vehicleId) => {
    if (intervalRefs.current[vehicleId]) {
      clearInterval(intervalRefs.current[vehicleId]);
      delete intervalRefs.current[vehicleId];

      setSimulationMap(prev => ({
        ...prev,
        [vehicleId]: { ...prev[vehicleId], status: 'paused' }
      }));
    }
  };

  const resumeSimulation = (vehicleId) => {
    const sim = simulationMap[vehicleId];
    if (!sim || !sim.fullData || sim.status !== 'paused') return;

    // Resume from the NEXT index (or current if it was at the end, but usually next)
    const nextIndex = sim.datasetIndex + 1;
    if (nextIndex < sim.fullData.length) {
      startSimulation(sim.fullData, vehicleId, nextIndex);
    } else {
      setSimulationMap(prev => ({
        ...prev,
        [vehicleId]: { ...prev[vehicleId], status: 'completed' }
      }));
    }
  };

  // ── OBD Live Socket (for real hardware, unchanged) ─────────────────────────
  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);

    s.on('vehicle_status', (status) => {
      if (!activeVehicleId) return;
      setSimulationMap(prev => ({
        ...prev,
        [activeVehicleId]: {
          ...prev[activeVehicleId],
          data: { ...(prev[activeVehicleId]?.data ?? EMPTY_DATA), isConnected: status.connected }
        }
      }));
    });

    s.on('live_update', async (data) => {
      if (!activeVehicleId) return;
      setSimulationMap(prev => ({
        ...prev,
        [activeVehicleId]: {
          ...prev[activeVehicleId],
          data: { ...(prev[activeVehicleId]?.data ?? EMPTY_DATA), ...data, isConnected: true }
        }
      }));
    });

    return () => s.disconnect();
  }, [activeVehicleId]);

  const connectVehicle    = () => { if (socket) socket.emit('connect_vehicle'); };
  const disconnectVehicle = () => {
    if (socket) socket.emit('disconnect_vehicle');
    if (activeVehicleId) {
      setSimulationMap(prev => ({
        ...prev,
        [activeVehicleId]: { ...prev[activeVehicleId], insights: null }
      }));
    }
  };

  return (
    <EVDataContext.Provider value={{
      vehicleData,
      insights,
      connectVehicle,
      disconnectVehicle,
      selectedVehicle,
      selectVehicle,
      toastMessage,
      startSimulation,
      stopSimulation,
      pauseSimulation,
      resumeSimulation,
      simulationMap,
    }}>
      {children}
    </EVDataContext.Provider>
  );
}

export function useEVData() {
  return useContext(EVDataContext);
}
