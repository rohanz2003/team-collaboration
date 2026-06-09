const express = require('express');
const { getCallHistory } = require('../controllers/callController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/history', protect, getCallHistory);

module.exports = router;
