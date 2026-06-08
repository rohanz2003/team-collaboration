const express = require('express');
const {
  sendInvite,
  acceptInvite,
  getInvites,
  cancelInvite,
  getInviteByToken,
} = require('../controllers/inviteController');
const { protect } = require('../middleware/authMiddleware');
const { inviteLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.get('/token/:token', getInviteByToken);
router.post('/accept', protect, acceptInvite);
router.get('/:workspaceId', protect, getInvites);
router.post('/:workspaceId', protect, inviteLimiter, sendInvite);
router.delete('/:inviteId', protect, cancelInvite);

module.exports = router;
