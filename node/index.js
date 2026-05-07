require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const jwt = require('jsonwebtoken');
const User = require('./models/User');
const VehicleDataLog = require('./models/VehicleDataLog');
const Vehicle = require('./models/Vehicle');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ev_chargewise';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Node Server: Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

let isConnected = false;

// Automatic simulation disabled to remove mock data. 
// System will now only react to real 'vehicle_data' events.

io.on('connection', (socket) => {
  console.log('Client connected to Node:', socket.id);
  
  socket.on('connect_vehicle', () => {
    isConnected = true;
    console.log('Vehicle Connected');
    io.emit('vehicle_status', { connected: true });
  });

  socket.on('disconnect_vehicle', () => {
    isConnected = false;
    console.log('Vehicle Disconnected');
    io.emit('vehicle_status', { connected: false });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('vehicle_data', async (data) => {
    try {
      // 1. Save to DB
      const log = new VehicleDataLog(data);
      await log.save();

      // 2. AI Analysis
      try {
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, data);
        socket.emit('insights', aiResponse.data);
      } catch (e) {
        console.error('FastAPI error:', e.message);
      }

      // 3. Broadcast live
      socket.emit('live_update', data);

    } catch (err) {
      console.error('Data error:', err);
    }
  });
});

const nodemailer = require('nodemailer');

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bhushanvenkatrajah.work@gmail.com',
    pass: process.env.EMAIL_PASS // User needs to provide App Password
  }
});

const sendWelcomeEmail = (email, name) => {
  const mailOptions = {
    from: '"EV Chargewise AI" <bhushanvenkatrajah.work@gmail.com>',
    to: email,
    subject: 'Welcome to the EV Intelligence Network ⚡',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
        <h1 style="color: #2563eb; text-align: center;">Welcome, ${name}!</h1>
        <p style="font-size: 16px; color: #333;">Your device has been successfully registered on the <b>EV Chargewise AI</b> platform.</p>
        <p style="font-size: 16px; color: #333;">You now have access to real-time telemetry, AI insights, and predictive analytics for your electric vehicle.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">© 2026 EV Chargewise AI. Automotive Intelligence Systems.</p>
      </div>
    `
  };
  transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));
};

const sendResetEmail = (email, token) => {
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  const mailOptions = {
    from: '"EV Chargewise AI Security" <bhushanvenkatrajah.work@gmail.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 15px;">
        <h2 style="color: #0f172a; margin-bottom: 20px;">Password Reset Requested</h2>
        <p style="color: #475569; line-height: 1.6;">We received a request to reset your password for your EV Chargewise AI account. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetLink}" style="background-color: #000000; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">If you did not request this, please ignore this email. This link will expire in 1 hour.</p>
      </div>
    `
  };
  transporter.sendMail(mailOptions).catch(err => console.error('Reset Email error:', err));
};

const sendVehicleCreatedEmail = (email, name, vehicleName) => {
  const mailOptions = {
    from: '"EV Chargewise AI Fleet" <bhushanvenkatrajah.work@gmail.com>',
    to: email,
    subject: `New Vehicle Initialized: ${vehicleName} ⚡`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
        <h1 style="color: #2563eb; text-align: center;">Vehicle Initialization Successful</h1>
        <p style="font-size: 16px; color: #333;">Hello ${name},</p>
        <p style="font-size: 16px; color: #333;">Your <b>${vehicleName}</b> has been successfully paired and initialized on the EV Chargewise AI platform.</p>
        <p style="font-size: 16px; color: #333;">Live telemetry analysis and AI forensic diagnostics are now active for this unit.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/connect" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Fleet Command</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">© 2026 EV Chargewise AI. Automotive Intelligence Systems.</p>
      </div>
    `
  };
  transporter.sendMail(mailOptions).catch(err => console.error('Vehicle Create Email error:', err));
};

const sendVehicleDeletedEmail = (email, name, vehicleName) => {
  const mailOptions = {
    from: '"EV Chargewise AI Fleet" <bhushanvenkatrajah.work@gmail.com>',
    to: email,
    subject: `Vehicle Profile Terminated: ${vehicleName} ⚠️`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 15px;">
        <h2 style="color: #dc2626; margin-bottom: 20px;">Profile Terminated</h2>
        <p style="color: #475569; line-height: 1.6;">Hello ${name},</p>
        <p style="color: #475569; line-height: 1.6;">The profile for your <b>${vehicleName}</b> has been permanently removed from the EV Chargewise AI network.</p>
        <p style="color: #475569; line-height: 1.6;">All associated telemetry logs and AI forensic data for this specific unit have been securely wiped.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">© 2026 EV Chargewise AI. Automotive Intelligence Systems.</p>
      </div>
    `
  };
  transporter.sendMail(mailOptions).catch(err => console.error('Vehicle Delete Email error:', err));
};

const sendRiskAlertEmail = (email, name, riskData) => {
  const mailOptions = {
    from: '"EV Chargewise AI Security" <bhushanvenkatrajah.work@gmail.com>',
    to: email,
    subject: `⚠️ HIGH RISK ALERT: ${riskData.riskLevel} Risk Detected`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Risk Alert Detected</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-weight: 500;">Vehicle: ${riskData.vehicleName}</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">
            <div style="text-align: center; flex: 1;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Risk Level</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #ef4444; font-weight: 700;">${riskData.riskLevel}</p>
            </div>
            <div style="text-align: center; flex: 1; border-left: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Speed</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #0f172a; font-weight: 700;">${riskData.speed} km/h</p>
            </div>
            <div style="text-align: center; flex: 1;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Battery</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #0f172a; font-weight: 700;">${riskData.soc}%</p>
            </div>
          </div>

          <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 15px; border-left: 4px solid #ef4444; padding-left: 10px;">AI Diagnostics</h3>
          <p style="background-color: #fef2f2; color: #991b1b; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">
            ${riskData.diagnostic}
          </p>

          <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 10px;">Full Telemetry Data</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Voltage</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${riskData.voltage} V</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Current</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${riskData.current} A</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Temp Avg</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${riskData.temp} °C</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Max Temp</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${riskData.maxTemp} °C</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Efficiency</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${riskData.efficiency} Wh/km</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Driving Score</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${riskData.drivingScore}/100</td>
            </tr>
          </table>

          <div style="margin-top: 30px; text-align: center;">
            <a href="http://localhost:3000/dashboard" style="background-color: #0f172a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Take Action Now</a>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">© 2026 EV Chargewise AI. This is an automated security alert.</p>
        </div>
      </div>
    `
  };
  transporter.sendMail(mailOptions).catch(err => console.error('Risk Alert Email error:', err));
};

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error();
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Auth Routes
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).send({ error: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).send({ error: 'Email already registered' });
    }
    const user = new User({ email, password, name });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Send Welcome Email
    sendWelcomeEmail(email, name);
    
    res.status(201).send({ user, token });
  } catch (e) {
    console.error('Registration Error:', e);
    res.status(500).send({ error: 'Internal server error during registration' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.send({ user, token });
  } catch (e) {
    res.status(500).send({ error: 'Login failed due to server error' });
  }
});

app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send({ message: 'If an account exists, a reset link has been sent.' });
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    sendResetEmail(email, token);
    res.send({ message: 'If an account exists, a reset link has been sent.' });
  } catch (e) {
    res.status(500).send({ error: 'Could not process request' });
  }
});

app.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).send({ error: 'User not found' });
    
    user.password = newPassword;
    await user.save();
    res.send({ message: 'Password reset successful' });
  } catch (e) {
    res.status(400).send({ error: 'Invalid or expired token' });
  }
});

app.get('/me', auth, (req, res) => {
  res.send({ user: req.user });
});

// Vehicle Routes
app.get('/vehicles', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user._id });
    res.send(vehicles);
  } catch (e) {
    res.status(500).send({ error: 'Could not fetch vehicles' });
  }
});

app.post('/vehicles', auth, async (req, res) => {
  try {
    const vehicle = new Vehicle({
      ...req.body,
      userId: req.user._id
    });
    await vehicle.save();
    
    // Send Vehicle Created Email
    const vehicleName = `${vehicle.manufacturer} ${vehicle.model}`;
    sendVehicleCreatedEmail(req.user.email, req.user.name, vehicleName);

    res.status(201).send(vehicle);
  } catch (e) {
    console.error('Save Vehicle Error:', e);
    res.status(400).send({ error: 'Could not save vehicle profile' });
  }
});

app.put('/vehicles/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (!vehicle) return res.status(404).send({ error: 'Vehicle not found' });
    res.send(vehicle);
  } catch (e) {
    console.error('Update Vehicle Error:', e);
    res.status(400).send({ error: 'Could not update vehicle profile' });
  }
});

app.delete('/vehicles/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!vehicle) return res.status(404).send({ error: 'Vehicle not found' });
    
    // Send Vehicle Deleted Email
    const vehicleName = `${vehicle.manufacturer} ${vehicle.model}`;
    sendVehicleDeletedEmail(req.user.email, req.user.name, vehicleName);

    res.send(vehicle);
  } catch (e) {
    res.status(500).send({ error: 'Could not delete vehicle' });
  }
});

app.get('/', (req, res) => res.send('EV Chargewise Node Backend'));

// ── Per-Vehicle Telemetry Routes ──────────────────────────────────────────────
// Save one telemetry tick for a specific vehicle
app.post('/telemetry/:vehicleId', auth, async (req, res) => {
  try {
    const log = new VehicleDataLog({
      vehicleId: req.params.vehicleId,
      userId: req.user._id,
      ...req.body
    });
    await log.save();
    res.status(201).send(log);
  } catch (e) {
    console.error('Telemetry save error:', e);
    res.status(400).send({ error: 'Could not save telemetry' });
  }
});

// Fetch all telemetry history for a specific vehicle (isolated)
app.get('/telemetry/:vehicleId', auth, async (req, res) => {
  try {
    const logs = await VehicleDataLog
      .find({ vehicleId: req.params.vehicleId })
      .sort({ timestamp: -1 })
      .limit(100);
    res.send(logs);
  } catch (e) {
    res.status(500).send({ error: 'Could not fetch telemetry' });
  }
});

// Risk Alert Route
app.post('/telemetry/:vehicleId/alert', auth, async (req, res) => {
  try {
    const { riskData } = req.body;
    sendRiskAlertEmail(req.user.email, req.user.name, riskData);
    res.send({ message: 'Alert email sent' });
  } catch (e) {
    console.error('Alert error:', e);
    res.status(500).send({ error: 'Could not send alert' });
  }
});
// ─────────────────────────────────────────────────────────────────────────────

server.listen(PORT, () => console.log(`Node server on port ${PORT}`));
