require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const recordingsRouter = require('./config/Routes/recordings');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins temporarily
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Remove gfs-related code
app.use('/api/recordings', recordingsRouter);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

module.exports = app;