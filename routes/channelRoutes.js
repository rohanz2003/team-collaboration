const express = require('express');
const {
  createChannel,
  getWorkspaceChannels,
} = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', protect, createChannel);
router.get('/:workspaceId', protect, getWorkspaceChannels);

module.exports = router;
