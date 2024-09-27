const Recording = require('../models/Recording');
const { encodeFile, decodeFile } = require('../utils/gridfsStorage');
const ffmpeg = require('fluent-ffmpeg');
const stream = require('stream');

exports.createRecording = async (req, res) => {
  try {
    const { name, duration } = req.body;
    const file = req.file;W

    if (!file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    console.log('File received:', file);

    // Encode the file to base64
    const base64Audio = encodeFile(file.buffer);

    const recording = new Recording({
      name,
      duration: parseInt(duration),
      filename: file.originalname,
      audioData: base64Audio
    });

    await recording.save();
    console.log('Recording metadata saved:', recording);

    res.status(201).json(recording);
  } catch (error) {
    console.error('Error creating recording:', error);
    res.status(500).json({ message: 'Error creating recording', error: error.message });
  }
};

exports.getAllRecordings = async (req, res) => {
  try {
    const recordings = await Recording.find().sort({ createdAt: -1 });
    
    // Convert base64 audio data to .ogg buffers
    const processedRecordings = recordings.map(recording => {
      const audioBuffer = decodeFile(recording.audioData);
      return {
        ...recording.toObject(),
        audioData: audioBuffer
      };
    });

    res.json(processedRecordings);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ message: 'Error fetching recordings', error: error.message });
  }
};

exports.updateLoopStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { loopStatus } = req.body;
    const recording = await Recording.findByIdAndUpdate(
      id,
      { loopStatus },
      { new: true }
    );
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }
    res.json(recording);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRecording = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    await deleteFile(recording.filename);
    await Recording.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Recording deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recording', error: error.message });
  }
};

exports.downloadRecording = async (req, res) => {
  try {
    const filename = req.params.filename;
    const recording = await Recording.findOne({ filename: filename });

    if (!recording) {
      return res.status(404).json({ message: 'File not found' });
    }

    const audioBuffer = decodeFile(recording.audioData);

    // Create a readable stream from the audio buffer
    const readableStream = new stream.Readable();
    readableStream.push(audioBuffer);
    readableStream.push(null);

    // Set appropriate headers
    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Disposition', `attachment; filename="${filename}.mp3"`);

    // Convert the audio to MP3 format using ffmpeg
    ffmpeg(readableStream)
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('error', (err) => {
        console.error('Error converting audio:', err);
        res.status(500).json({ message: 'Error converting audio', error: err.message });
      })
      .pipe(res);

  } catch (error) {
    console.error('Error in downloadRecording:', error);
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
};