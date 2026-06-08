const express = require('express');
const {
  getMessages,
  searchMessages,
  editMessage,
  deleteMessage,
  replyMessage,
  getReplies,
  markSeen,
} = require('../controllers/messageController');
const { toggleReaction } = require('../controllers/reactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:channelId', protect, getMessages);
router.get('/:channelId/search', protect, searchMessages);
router.get('/:messageId/replies', protect, getReplies);
router.put('/:messageId/edit', protect, editMessage);
router.delete('/:messageId', protect, deleteMessage);
router.post('/:messageId/reply', protect, replyMessage);
router.put('/:messageId/react', protect, toggleReaction);
router.post('/:channelId/seen', protect, markSeen);

module.exports = router;
