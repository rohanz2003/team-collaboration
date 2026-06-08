const Message = require('../models/Message');
const Channel = require('../models/Channel');
const Workspace = require('../models/Workspace');
const { summarizeMessages, askAI, generateActionItems, generateEmbedding } = require('../services/aiService');
const { cacheAIResult, getCachedAIResult } = require('../services/cacheService');
const User = require('../models/User');
const logger = require('../services/loggerService');

async function checkAIQuota(req, res, next) {
  const user = await User.findById(req.user._id);
  if (!user.canUseAI()) {
    if (user.isPro()) return next();
    return res.status(403).json({
      message: 'AI query limit reached. Upgrade to Pro for unlimited AI access.',
      code: 'AI_QUOTA_EXCEEDED',
    });
  }
  if (!user.isPro()) {
    user.aiQuota.used += 1;
    await user.save();
  }
  next();
}

const summarizeChannel = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ message: 'AI is not configured — set OPENAI_API_KEY or OPENROUTER_API_KEY on the server.' });
    }
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    const workspace = await Workspace.findById(channel.workspace);
    if (!workspace.getUserRole(req.user._id)) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    const cached = await getCachedAIResult(`summarize:${channelId}`);
    if (cached) return res.json({ ...cached, cached: true });

    const messages = await Message.find({
      channel: channelId,
      deleted: false,
      text: { $ne: '' },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('sender', 'name email')
      .lean();

    const result = await summarizeMessages(messages.reverse());
    await cacheAIResult(`summarize:${channelId}`, result, 600);

    logger.info(`Channel summarized: ${channel.name} by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const summarizeWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (!workspace.getUserRole(req.user._id)) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    const cached = await getCachedAIResult(`summarize-ws:${workspaceId}`);
    if (cached) return res.json({ ...cached, cached: true });

    const channels = await Channel.find({ workspace: workspaceId });
    const channelIds = channels.map((c) => c._id);

    const messages = await Message.find({
      channel: { $in: channelIds },
      deleted: false,
      text: { $ne: '' },
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('sender', 'name email')
      .lean();

    const result = await summarizeMessages(messages.reverse());
    await cacheAIResult(`summarize-ws:${workspaceId}`, result, 600);

    logger.info(`Workspace summarized: ${workspace.name} by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const askAIQuestion = async (req, res) => {
  try {
    const { question, channelId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }
    if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ message: 'AI is not configured — set OPENAI_API_KEY or OPENROUTER_API_KEY on the server.' });
    }

    const cacheKey = `ai-ask:${channelId || 'global'}:${question.trim().toLowerCase().slice(0, 100)}`;
    const cached = await getCachedAIResult(cacheKey);
    if (cached) return res.json({ answer: cached.answer, cached: true });

    let context = [];
    if (channelId) {
      const channel = await Channel.findById(channelId);
      if (!channel) return res.status(404).json({ message: 'Channel not found' });

      const workspace = await Workspace.findById(channel.workspace);
      if (!workspace.getUserRole(req.user._id)) {
        return res.status(403).json({ message: 'Not a workspace member' });
      }

      context = await Message.find({
        channel: channelId,
        deleted: false,
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('sender', 'name email')
        .lean();
    }

    const answer = await askAI(question.trim(), context.reverse());
    await cacheAIResult(cacheKey, { answer }, 300);

    logger.info(`AI query: ${question.slice(0, 80)} by ${req.user.email}`);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActionItems = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    const workspace = await Workspace.findById(channel.workspace);
    if (!workspace.getUserRole(req.user._id)) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    const cached = await getCachedAIResult(`actions:${channelId}`);
    if (cached) return res.json({ ...cached, cached: true });

    const messages = await Message.find({
      channel: channelId,
      deleted: false,
      text: { $ne: '' },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('sender', 'name email')
      .lean();

    const result = await generateActionItems(messages.reverse());
    await cacheAIResult(`actions:${channelId}`, result, 600);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const semanticSearch = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    const workspace = await Workspace.findById(channel.workspace);
    if (!workspace.getUserRole(req.user._id)) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    const queryEmbedding = await generateEmbedding(q.trim());

    const messages = await Message.aggregate([
      {
        $match: {
          channel: channel._id,
          deleted: false,
          text: { $ne: '', $exists: true },
        },
      },
      {
        $addFields: {
          textLength: { $strLenCP: { $ifNull: ['$text', ''] } },
        },
      },
      {
        $match: { textLength: { $gte: 3 } },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 200 },
    ]);

    const results = messages
      .map((msg) => ({
        ...msg,
        _score: computeSimpleSimilarity(q.trim().toLowerCase(), (msg.text || '').toLowerCase()),
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 15);

    const populatedResults = await Message.populate(results, [
      { path: 'sender', select: 'name email' },
      { path: 'reactions.userId', select: 'name email' },
    ]);

    logger.info(`Semantic search: "${q}" in ${channel.name} by ${req.user.email}`);
    res.json({ messages: populatedResults });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function computeSimpleSimilarity(query, text) {
  const queryWords = query.split(/\s+/).filter(Boolean);
  const textWords = new Set(text.split(/\s+/).filter(Boolean));
  if (queryWords.length === 0 || textWords.size === 0) return 0;
  const matches = queryWords.filter((w) => textWords.has(w)).length;
  return matches / queryWords.length;
}

module.exports = {
  summarizeChannel,
  summarizeWorkspace,
  askAIQuestion,
  getActionItems,
  semanticSearch,
  checkAIQuota,
};
