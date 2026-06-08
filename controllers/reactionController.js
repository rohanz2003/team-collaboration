const Message = require('../models/Message');
const { invalidateChannelCache } = require('../services/cacheService');

const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString() && r.type === type
    );

    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      const existingUserReaction = message.reactions.find(
        (r) => r.userId.toString() === userId.toString()
      );
      if (existingUserReaction) {
        existingUserReaction.type = type;
      } else {
        message.reactions.push({ userId, type });
      }
    }

    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('reactions.userId', 'name email')
      .lean();

    await invalidateChannelCache(message.channel);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleReaction };
