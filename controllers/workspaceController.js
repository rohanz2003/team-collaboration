const Workspace = require('../models/Workspace');
const Channel = require('../models/Channel');
const Notification = require('../models/Notification');
const logger = require('../services/loggerService');

const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please add a workspace name' });
    }

    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    const populated = await Workspace.findById(workspace._id)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    const result = populated.toObject();
    result.channels = [];

    logger.info(`Workspace created: ${name} by ${req.user.email}`);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user._id,
    })
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    const workspaceIds = workspaces.map((w) => w._id);

    const channelCounts = await Channel.aggregate([
      { $match: { workspace: { $in: workspaceIds } } },
      { $group: { _id: '$workspace', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    channelCounts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    const result = workspaces.map((ws) => {
      const obj = ws.toObject();
      obj.channels = [];
      const count = countMap[ws._id.toString()] || 0;
      for (let i = 0; i < count; i++) obj.channels.push({ _id: i });
      return obj;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWorkspaceMembers = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const userRole = workspace.getUserRole(req.user._id);
    if (!userRole) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    res.json({ members: workspace.members, owner: workspace.owner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { userId, role } = req.body;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const requesterRole = workspace.getUserRole(req.user._id);
    if (requesterRole !== 'owner' && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Only owner or admin can change roles' });
    }

    if (requesterRole === 'admin' && role === 'owner') {
      return res.status(403).json({ message: 'Admin cannot promote to owner' });
    }

    if (workspace.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot change owner role' });
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === userId
    );
    if (!member) {
      return res.status(404).json({ message: 'User is not a member' });
    }

    member.role = role;
    await workspace.save();

    const populated = await Workspace.findById(workspace._id)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    await Notification.create({
      user: userId,
      type: 'role_changed',
      title: 'Role Updated',
      message: `Your role in "${workspace.name}" has been changed to ${role}`,
      relatedWorkspace: workspace._id,
      relatedUser: req.user._id,
      link: `/workspace?workspaceId=${workspace._id}`,
    });

    logger.info(`Role updated: ${userId} -> ${role} in workspace ${workspace.name}`);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const requesterRole = workspace.getUserRole(req.user._id);
    if (requesterRole !== 'owner' && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Only owner or admin can remove members' });
    }

    if (workspace.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the workspace owner' });
    }

    const memberIndex = workspace.members.findIndex(
      (m) => m.user.toString() === userId
    );
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'User is not a member' });
    }

    if (requesterRole === 'admin') {
      const targetRole = workspace.members[memberIndex].role;
      if (targetRole === 'admin' || targetRole === 'owner') {
        return res.status(403).json({ message: 'Admin cannot remove other admins or owner' });
      }
    }

    workspace.members.splice(memberIndex, 1);
    await workspace.save();

    const populated = await Workspace.findById(workspace._id)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    await Notification.create({
      user: userId,
      type: 'member_removed',
      title: 'Removed from Workspace',
      message: `You have been removed from "${workspace.name}"`,
      relatedWorkspace: workspace._id,
      relatedUser: req.user._id,
    });

    logger.info(`Member removed: ${userId} from workspace ${workspace.name}`);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the workspace owner can delete the workspace' });
    }

    await Workspace.findByIdAndDelete(req.params.workspaceId);

    logger.info(`Workspace deleted: ${workspace.name} by ${req.user.email}`);

    res.json({ message: 'Workspace deleted', workspaceId: req.params.workspaceId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
  deleteWorkspace,
};
