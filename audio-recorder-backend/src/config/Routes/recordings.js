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

// Update this route to use the controller
router.get('/download/:filename', recordingController.downloadRecording);

module.exports = router;