const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    required: true
  },
  specs: {
    batteryCapacity: Number, // kWh
    batteryVoltage: Number, // V
    chargingVoltage: Number, // V
    maxChargingSpeed: Number, // kW
    claimedRange: Number, // km
    realWorldRange: Number, // km
    motorPower: Number, // kW
    torque: Number, // Nm
    topSpeed: Number, // km/h
    coolingType: String,
    weight: Number, // kg
    year: Number
  },
  bluetoothId: String,
  deviceName: String,
  lastConnected: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
