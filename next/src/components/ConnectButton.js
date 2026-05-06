import React, { useState } from 'react';
import { Bluetooth, BluetoothSearching, CheckCircle2 } from 'lucide-react';

const ConnectButton = ({ isConnected, setIsConnected, socket }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToVehicle = async () => {
    setIsConnecting(true);
    
    // Web Bluetooth simulation
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      startSimulation();
    }, 2000);
  };

  const startSimulation = () => {
    let soc = 85;
    setInterval(() => {
      soc -= 0.1;
      const data = {
        vehicleId: "v-101",
        speed: Math.floor(Math.random() * 20) + 40,
        soc: parseFloat(soc.toFixed(1)),
        voltage: 395 + Math.random() * 10,
        current: 10 + Math.random() * 50,
        temperature: 32 + Math.random() * 5,
        acceleration: Math.random() * 6 - 2
      };
      socket.emit('vehicle_data', data);
    }, 2000);
  };

  return (
    <button
      onClick={connectToVehicle}
      disabled={isConnected || isConnecting}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
        isConnected 
        ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' 
        : isConnecting
        ? 'bg-blue-100 text-blue-600 cursor-wait'
        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200'
      }`}
    >
      {isConnected ? (
        <>
          <CheckCircle2 className="w-5 h-5" />
          Vehicle Connected
        </>
      ) : isConnecting ? (
        <>
          <BluetoothSearching className="w-5 h-5 animate-pulse" />
          Connecting...
        </>
      ) : (
        <>
          <Bluetooth className="w-5 h-5" />
          Connect Vehicle
        </>
      )}
    </button>
  );
};

export default ConnectButton;
