const express = require('express');
const multer = require('multer');
const recordingController = require('../controllers/recordingController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', (req, res, next) => {
    console.log("eee")
    console.log(req.body);
    // console.log('Received POST request to /api/recordings');
    // console.log('Request headers:', req.headers);
    // console.log('Request body:', req.body);
    next();
}, upload.single('audio'), recordingController.createRecording);

router.get('/', recordingController.getAllRecordings);
router.patch('/:id/loop', recordingController.updateLoopStatus);
router.delete('/:id', recordingController.deleteRecording);
router.get('/download/:filename', recordingController.downloadRecording);

module.exports = router;