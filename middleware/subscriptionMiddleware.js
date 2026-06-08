const User = require('../models/User');

const requirePro = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.plan !== 'pro' || user.subscriptionStatus !== 'active') {
      return res.status(403).json({
        message: 'This feature requires a Pro subscription. Upgrade to access.',
        code: 'PRO_REQUIRED',
        upgradeUrl: '/api/payment/create-checkout',
      });
    }

    req.subscription = {
      plan: user.plan,
      status: user.subscriptionStatus,
    };

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkFeatureAccess = (feature) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      const featureLimits = {
        aiAssistant: { free: false, pro: true },
        semanticSearch: { free: false, pro: true },
        videoCalls: { free: true, pro: true },
        fileUploads: { free: '5mb', pro: '50mb' },
        channels: { free: 10, pro: Infinity },
      };

      const limit = featureLimits[feature];
      if (!limit) return next();

      const access = limit[user.plan];
      if (access === false) {
        return res.status(403).json({
          message: `Feature "${feature}" requires Pro subscription`,
          code: 'PRO_REQUIRED',
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = { requirePro, checkFeatureAccess };
