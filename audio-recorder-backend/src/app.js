require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const recordingsRouter = require('./config/Routes/recordings');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'https://audio-recorder-update.vercel.app',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

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