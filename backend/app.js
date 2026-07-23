const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const dns = require('dns')

dns.setServers(["1.1.1.1","8.8.8.8"])

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err)
);

// Socket.io connection handling
const userSockets = {}; // Map to store userId -> socketId

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('user_connected', (userId) => {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    // Remove user from map
    Object.keys(userSockets).forEach(key => {
      if (userSockets[key] === socket.id) {
        delete userSockets[key];
      }
    });
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  req.userSockets = userSockets;
  next();
});

// Routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feeRoutes = require('./routes/feeRoutes');
const branchRoutes = require('./routes/branchRoutes');
const donationRoutes = require('./routes/donationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});