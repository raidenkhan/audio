require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const connectDB = require('./config/database');
const recordingsRouter = require('./config/Routes/recordings');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// CORS configuration with wildcard origin for debugging
app.use(cors({
  origin: '*', // WARNING: Only use this for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let gfs;

mongoose.connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'recordings'
  });
  app.set('gfs', gfs);
  console.log('GridFS connected');

  // Set up routes after GridFS is connected
  app.use('/api/recordings', (req, res, next) => {
    req.gfs = gfs;
    next();
  }, recordingsRouter);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

module.exports = app;