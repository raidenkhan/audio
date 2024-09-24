const express = require('express');
const multer = require('multer');
const { storage } = require('../utils/gridfsStorage');
const recordingController = require('../controllers/recordingController');

const router = express.Router();
const upload = multer({ storage });

router.post('/', upload.single('audio'), recordingController.createRecording);
router.get('/', recordingController.getAllRecordings);
router.patch('/:id/loop', recordingController.updateLoopStatus);
router.delete('/:id', recordingController.deleteRecording);

// Add a new route to serve audio files
router.get('/audio/:filename', (req, res) => {
  const { filename } = req.params;
  const gfs = req.app.get('gfs');
  
  const readstream = gfs.openDownloadStreamByName(filename);
  readstream.pipe(res);
});

module.exports = router;