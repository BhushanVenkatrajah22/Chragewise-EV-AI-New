const mongoose = require('mongoose');

const vehicleDataLogSchema = new mongoose.Schema({
  vehicleId:          { type: String, required: true, index: true },
  userId:             { type: String },
  timestamp:          { type: Date, default: Date.now },
  datasetIndex:       { type: Number },
  // Core Electrical
  soc:                Number,  // State of Charge %
  soh:                Number,  // State of Health %
  voltage:            Number,  // Total Pack Voltage V
  current:            Number,  // Instantaneous Current A
  minCellVoltage:     Number,
  maxCellVoltage:     Number,
  cellVoltageDelta:   Number,
  // Thermal
  batteryTempAvg:     Number,
  maxBatteryTemp:     Number,
  motorTemp:          Number,
  inverterTemp:       Number,
  // Dynamics
  speed:              Number,
  acceleratorPos:     Number,
  brakePedalPos:      Number,
  regenPower:         Number,
  odometer:           Number,
  // Charging
  chargingStatus:     Boolean,
  plugConnected:      Boolean,
  maxChargeCurrent:   Number,
  chargingPower:      Number,
  // Derived
  predictedRange:     Number,
  efficiency:         Number,
  // AI Scores
  aiDrivingScore:     Number,
  aiThermalRisk:      Number,
  aiBatteryDegRisk:   Number,
  aiMaintenancePred:  String,
  aiHealthScore:      Number,
});

module.exports = mongoose.model('VehicleDataLog', vehicleDataLogSchema);
