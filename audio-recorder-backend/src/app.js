require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
//const socketIo = require('socket.io');
const connectDB = require('./config/database');
const recordingsRouter = require('./config/Routes/recordings');
//const authRouter = require('./config/Routes/auth');

// ... other code


const app = express();
const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"]
//   }
// });

const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/recordings', recordingsRouter);

const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');

let gfs;

mongoose.connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'recordings'
  });
  app.set('gfs', gfs);
});

// io.on('connection', (socket) => {
//   console.log('New client connected');
  
//   socket.on('startRecording', (data) => {
//     socket.broadcast.emit('recordingStarted', data);
//   });

//   socket.on('stopRecording', (data) => {
//     socket.broadcast.emit('recordingStopped', data);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});