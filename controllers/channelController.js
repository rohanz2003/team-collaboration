const Channel = require('../models/Channel');
const Workspace = require('../models/Workspace');
const logger = require('../services/loggerService');

const createChannel = async (req, res) => {
  try {
    const { name, workspaceId } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({ message: 'Please add name and workspaceId' });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const userRole = workspace.getUserRole(req.user._id);
    if (!userRole) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only owner or admin can create channels' });
    }

    const channel = await Channel.create({
      name,
      workspace: workspaceId,
      createdBy: req.user._id,
    });

    res.status(201).json(channel);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Channel name already exists in this workspace' });
    }
    res.status(500).json({ message: error.message });
  }
};

const getWorkspaceChannels = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const userRole = workspace.getUserRole(req.user._id);
    if (!userRole) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    const channels = await Channel.find({ workspace: workspaceId });

    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const workspace = await Workspace.findById(channel.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const userRole = workspace.getUserRole(req.user._id);
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only owner or admin can delete channels' });
    }

    await Channel.findByIdAndDelete(channelId);

    logger.info(`Channel deleted: ${channel.name} from workspace ${workspace.name} by ${req.user.email}`);

    res.json({ message: 'Channel deleted', channelId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createChannel, getWorkspaceChannels, deleteChannel };
