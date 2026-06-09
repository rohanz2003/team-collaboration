const CallHistory = require('../models/CallHistory');
const Workspace = require('../models/Workspace');

const getCallHistory = async (req, res) => {
  try {
    const { workspaceId, limit: queryLimit } = req.query;
    const limit = parseInt(queryLimit) || 50;
    const userId = req.user._id;

    const filter = {
      $or: [{ caller: userId }, { receiver: userId }],
    };

    if (workspaceId) {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      const userRole = workspace.getUserRole(userId);
      if (!userRole) {
        return res.status(403).json({ message: 'Not a workspace member' });
      }
      filter.workspace = workspaceId;
    }

    const calls = await CallHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('caller', 'name email')
      .populate('receiver', 'name email')
      .populate('workspace', 'name')
      .lean();

    const total = await CallHistory.countDocuments(filter);

    res.json({ calls, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCallHistory };
