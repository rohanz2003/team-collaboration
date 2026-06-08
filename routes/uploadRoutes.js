const express = require('express');
const { uploadFile } = require('../controllers/uploadController');
const { upload } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;
