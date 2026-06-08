const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../services/loggerService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      token: generateToken(user._id),
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    logger.info(`User logged in: ${email}`);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      token: generateToken(user._id),
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
};

module.exports = { registerUser, loginUser, getMe };
