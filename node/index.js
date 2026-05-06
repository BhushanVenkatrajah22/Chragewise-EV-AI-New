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

io.on('connection', (socket) => {
  console.log('Client connected to Node:', socket.id);

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

// Auth Routes
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = new User({ email, password, name });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send({ error: 'Registration failed. Email might already exist.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: 'Invalid login credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/', (req, res) => res.send('EV Chargewise Node Backend'));

server.listen(PORT, () => console.log(`Node server on port ${PORT}`));
