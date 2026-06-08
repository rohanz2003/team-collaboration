const express = require('express');
const {
  createCheckoutSession,
  handleWebhook,
  demoUpgrade,
  getSubscriptionStatus,
  cancelSubscription,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-checkout', protect, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
router.post('/demo-upgrade', protect, demoUpgrade);
router.get('/status', protect, getSubscriptionStatus);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
