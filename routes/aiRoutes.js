const express = require('express');
const {
  summarizeChannel,
  summarizeWorkspace,
  askAIQuestion,
  getActionItems,
  semanticSearch,
  checkAIQuota,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { requirePro } = require('../middleware/subscriptionMiddleware');

const router = express.Router();

router.post('/ask', protect, checkAIQuota, askAIQuestion);
router.get('/summarize/:channelId', protect, checkAIQuota, summarizeChannel);
router.get('/summarize-workspace/:workspaceId', protect, checkAIQuota, summarizeWorkspace);
router.get('/actions/:channelId', protect, checkAIQuota, getActionItems);
router.get('/semantic-search/:channelId', protect, requirePro, semanticSearch);

module.exports = router;
