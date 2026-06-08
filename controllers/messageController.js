const Message = require('../models/Message');
const Channel = require('../models/Channel');
const Workspace = require('../models/Workspace');
const { getChannelMessages, setChannelMessages, invalidateChannelCache } = require('../services/cacheService');

const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const workspace = await Workspace.findById(channel.workspace);
    const userRole = workspace.getUserRole(req.user._id);
    if (!userRole) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    if (page === 1) {
      const cached = await getChannelMessages(channelId);
      if (cached) {
        const total = await Message.countDocuments({ channel: channelId });
        const pages = Math.ceil(total / limit);
        return res.json({
          messages: cached,
          total,
          page,
          pages,
          hasMore: skip + limit < total,
          cached: true,
        });
      }
    }

    const messages = await Message.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email')
      .populate('reactions.userId', 'name email')
      .populate('replyTo')
      .lean();

    const total = await Message.countDocuments({ channel: channelId });
    const pages = Math.ceil(total / limit);

    const reversed = messages.reverse();

    if (page === 1) {
      await setChannelMessages(channelId, reversed);
    }

    res.json({
      messages: reversed,
      total,
      page,
      pages,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const workspace = await Workspace.findById(channel.workspace);
    const userRole = workspace.getUserRole(req.user._id);
    if (!userRole) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    const messages = await Message.find({
      channel: channelId,
      $or: [
        { text: { $regex: q.trim(), $options: 'i' } },
        { fileName: { $regex: q.trim(), $options: 'i' } },
      ],
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('sender', 'name email')
      .populate('reactions.userId', 'name email')
      .lean();

    res.json({ messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Can only edit your own messages' });
    }

    if (message.deleted) {
      return res.status(400).json({ message: 'Cannot edit deleted message' });
    }

    message.text = text.trim();
    message.edited = true;
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

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Can only delete your own messages' });
    }

    message.deleted = true;
    message.text = '';
    message.fileUrl = null;
    message.fileName = null;
    message.fileType = null;
    await message.save();

    await invalidateChannelCache(message.channel);

    res.json({ messageId: message._id, channelId: message.channel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const replyMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Reply text required' });
    }

    const parent = await Message.findById(messageId);
    if (!parent) {
      return res.status(404).json({ message: 'Original message not found' });
    }

    const reply = await Message.create({
      sender: userId,
      channel: parent.channel,
      text: text.trim(),
      replyTo: messageId,
    });

    const populated = await Message.findById(reply._id)
      .populate('sender', 'name email')
      .populate('reactions.userId', 'name email')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name email' },
      })
      .lean();

    await invalidateChannelCache(parent.channel);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReplies = async (req, res) => {
  try {
    const { messageId } = req.params;

    const parent = await Message.findById(messageId);
    if (!parent) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const replies = await Message.find({ replyTo: messageId, deleted: false })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email')
      .populate('reactions.userId', 'name email')
      .lean();

    res.json({ replies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markSeen = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const result = await Message.updateMany(
      {
        channel: channelId,
        'sender': { $ne: userId },
        'seenBy': { $ne: userId },
      },
      {
        $addToSet: { seenBy: userId },
      }
    );

    res.json({ modified: result.modifiedCount, channelId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
  searchMessages,
  editMessage,
  deleteMessage,
  replyMessage,
  getReplies,
  markSeen,
};
