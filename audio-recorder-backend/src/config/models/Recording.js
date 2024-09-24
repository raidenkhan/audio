const mongoose = require('mongoose');

const RecordingSchema = new mongoose.Schema({
  name: String,
  duration: Number,
  filename: String,
  loop: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recording', RecordingSchema);