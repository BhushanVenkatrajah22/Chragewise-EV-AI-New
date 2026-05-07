"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const EVDataContext = createContext();

export function EVDataProvider({ children }) {
  const [vehicleData, setVehicleData] = useState({
    batteryLevel: 0,
    temperature: 0,
    voltage: 0,
    current: 0,
    speed: 0,
    range: 0,
    healthScore: 0,
    safetyScore: 0,
    efficiency: 0,
    isConnected: false
  });

  const [insights, setInsights] = useState(null);
  const [socket, setSocket] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Load selected vehicle from localStorage on mount
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

  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);

    s.on('vehicle_status', (status) => {
      setVehicleData(prev => ({ ...prev, isConnected: status.connected }));
      if (!status.connected) setInsights(null);
    });

    s.on('live_update', async (data) => {
      setVehicleData(prev => ({ ...prev, ...data, isConnected: true }));
      
      // Call Groq AI through FastAPI
      try {
        const response = await fetch('http://localhost:8000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: selectedVehicle?._id || "EV-001",
            manufacturer: selectedVehicle?.manufacturer || "Generic",
            model: selectedVehicle?.model || "EV",
            variant: selectedVehicle?.variant || "Base",
            specs: selectedVehicle?.specs || {},
            speed: data.speed || data.speedValue || 0,
            soc: data.batteryLevel || data.soc || 0,
            voltage: parseFloat(data.voltage) || 0,
            current: parseFloat(data.current) || 0,
            temperature: data.temperature || 0,
            acceleration: data.acceleration || 0
          })
        });
        const aiInsights = await response.json();
        setInsights(aiInsights);
      } catch (err) {
        console.error("AI Insight Error:", err);
      }
    });

    return () => s.disconnect();
  }, []);

  const connectVehicle = () => {
    if (socket) socket.emit('connect_vehicle');
  };

  const disconnectVehicle = () => {
    if (socket) socket.emit('disconnect_vehicle');
    setInsights(null);
  };

  return (
    <EVDataContext.Provider value={{ 
      vehicleData, 
      insights, 
      connectVehicle, 
      disconnectVehicle, 
      selectedVehicle, 
      selectVehicle 
    }}>
      {children}
    </EVDataContext.Provider>
  );
}

export function useEVData() {
  return useContext(EVDataContext);
}
