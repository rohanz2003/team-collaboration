const User = require('../models/User');
const logger = require('../services/loggerService');

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    name: 'Pro',
    amount: 999,
    currency: 'usd',
  },
};

const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        message: 'Payment system not configured. Set STRIPE_SECRET_KEY.',
        demo: true,
        demoUrl: '/api/payment/demo-upgrade',
      });
    }

    const { plan } = req.body;
    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const user = await User.findById(req.user._id);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price: PLANS[plan].priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/workspace?upgrade=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/workspace?upgrade=canceled`,
      metadata: {
        userId: user._id.toString(),
        plan,
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    logger.error(`Checkout session error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const handleWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(200).json({ received: true });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error(`Webhook signature error: ${err.message}`);
    return res.status(400).json({ message: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;

        await User.findByIdAndUpdate(userId, {
          plan,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          subscriptionStatus: 'active',
        });

        logger.info(`User ${userId} upgraded to ${plan}`);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const status = subscription.status;
        const customerId = subscription.customer;

        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          const isActive = status === 'active' || status === 'trialing';
          user.subscriptionStatus = status;
          if (!isActive) user.plan = 'free';
          await user.save();
          logger.info(`User ${user.email} subscription ${status}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          user.subscriptionStatus = 'past_due';
          await user.save();
          logger.warn(`Payment failed for ${user.email}`);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error(`Webhook handler error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const demoUpgrade = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.plan = 'pro';
    user.subscriptionStatus = 'active';
    user.stripeCustomerId = 'demo_customer';
    user.stripeSubscriptionId = 'demo_sub';
    await user.save();

    logger.info(`Demo upgrade: ${user.email} -> pro`);

    res.json({
      message: 'Upgraded to Pro (demo mode)',
      plan: 'pro',
      subscriptionStatus: 'active',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      aiQuota: user.aiQuota,
      isPro: user.isPro(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.stripeSubscriptionId || !stripe) {
      user.plan = 'free';
      user.subscriptionStatus = 'canceled';
      await user.save();
      return res.json({ message: 'Subscription canceled' });
    }

    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    user.plan = 'free';
    user.subscriptionStatus = 'canceled';
    await user.save();

    logger.info(`Subscription canceled: ${user.email}`);
    res.json({ message: 'Subscription canceled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  demoUpgrade,
  getSubscriptionStatus,
  cancelSubscription,
};
