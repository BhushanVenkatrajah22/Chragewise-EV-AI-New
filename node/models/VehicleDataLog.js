const mongoose = require('mongoose');

const vehicleDataLogSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  speed: Number,
  soc: Number,
  voltage: Number,
  current: Number,
  temperature: Number,
  acceleration: Number
});

module.exports = mongoose.model('VehicleDataLog', vehicleDataLogSchema);
