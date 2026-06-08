const express = require('express');
const {
  createChannel,
  getWorkspaceChannels,
  deleteChannel,
} = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', protect, createChannel);
router.get('/:workspaceId', protect, getWorkspaceChannels);
router.delete('/:channelId', protect, deleteChannel);

module.exports = router;
