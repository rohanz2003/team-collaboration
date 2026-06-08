const Invite = require('../models/Invite');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendInviteEmail } = require('../services/emailService');
const logger = require('../services/loggerService');

const sendInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const requesterRole = workspace.getUserRole(req.user._id);
    if (requesterRole !== 'owner' && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Only owner or admin can invite members' });
    }

    const existingInvite = await Invite.findOne({
      email: email.toLowerCase().trim(),
      workspace: workspaceId,
      status: 'pending',
    });
    if (existingInvite) {
      return res.status(400).json({ message: 'An invite has already been sent to this email' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      const isMember = workspace.members.some(
        (m) => m.user.toString() === user._id.toString()
      );
      if (isMember) {
        return res.status(400).json({ message: 'User is already a member of this workspace' });
      }
    }

    const invite = await Invite.create({
      email: email.toLowerCase().trim(),
      workspace: workspaceId,
      invitedBy: req.user._id,
    });

    const inviteLink = `/invite?token=${invite.token}`;

    try {
      await sendInviteEmail({
        email: invite.email,
        invitedByName: req.user.name,
        workspaceName: workspace.name,
        inviteLink,
      });
    } catch (emailError) {
      logger.error(`Invite email failed to send: ${emailError.message}`);
    }

    if (user) {
      await Notification.create({
        user: user._id,
        type: 'invite_received',
        title: 'Workspace Invitation',
        message: `You've been invited to join "${workspace.name}" by ${req.user.name}`,
        relatedWorkspace: workspace._id,
        relatedUser: req.user._id,
        link: inviteLink,
      });
    }

    logger.info(`Invite sent: ${email} to workspace ${workspace.name} by ${req.user.email}`);

    res.status(201).json({
      message: 'Invite sent successfully',
      invite: {
        _id: invite._id,
        email: invite.email,
        status: invite.status,
        createdAt: invite.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Invite token is required' });
    }

    const invite = await Invite.findOne({ token });
    if (!invite) {
      return res.status(404).json({ message: 'Invalid or expired invite token' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: `Invite is already ${invite.status}` });
    }

    if (invite.isExpired()) {
      invite.status = 'expired';
      await invite.save();
      return res.status(400).json({ message: 'Invite has expired' });
    }

    if (invite.email !== req.user.email) {
      return res.status(403).json({ message: 'This invite was sent to a different email address' });
    }

    const workspace = await Workspace.findById(invite.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace no longer exists' });
    }

    const isMember = workspace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (isMember) {
      invite.status = 'accepted';
      invite.acceptedAt = new Date();
      await invite.save();
      return res.json({ message: 'Already a member', workspace: workspace._id });
    }

    workspace.members.push({ user: req.user._id, role: 'member' });
    await workspace.save();

    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();

    const populated = await Workspace.findById(workspace._id)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    const adminMembers = workspace.members.filter(
      (m) => m.role === 'admin' || m.role === 'owner'
    );
    for (const admin of adminMembers) {
      if (admin.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: admin.user,
          type: 'user_joined_workspace',
          title: 'New Member Joined',
          message: `${req.user.name} has joined "${workspace.name}"`,
          relatedWorkspace: workspace._id,
          relatedUser: req.user._id,
          link: `/workspace?workspaceId=${workspace._id}`,
        });
      }
    }

    logger.info(`Invite accepted: ${req.user.email} joined workspace ${workspace.name}`);

    const populatedInvite = await Invite.findById(invite._id)
      .populate('workspace', 'name')
      .populate('invitedBy', 'name email');

    res.json({
      message: 'Successfully joined workspace',
      workspace: populated,
      invite: populatedInvite,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvites = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const requesterRole = workspace.getUserRole(req.user._id);
    if (requesterRole !== 'owner' && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Only owner or admin can view invites' });
    }

    const invites = await Invite.find({ workspace: workspaceId })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ invites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    const workspace = await Workspace.findById(invite.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const requesterRole = workspace.getUserRole(req.user._id);
    if (requesterRole !== 'owner' && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Only owner or admin can cancel invites' });
    }

    invite.status = 'cancelled';
    await invite.save();

    logger.info(`Invite cancelled: ${invite.email} by ${req.user.email}`);

    res.json({ message: 'Invite cancelled', inviteId: invite._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInviteByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await Invite.findOne({ token })
      .populate('workspace', 'name')
      .populate('invitedBy', 'name email');

    if (!invite) {
      return res.status(404).json({ message: 'Invalid invite token' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: `Invite is already ${invite.status}` });
    }

    if (invite.isExpired()) {
      invite.status = 'expired';
      await invite.save();
      return res.status(400).json({ message: 'Invite has expired' });
    }

    res.json({
      email: invite.email,
      workspace: invite.workspace,
      invitedBy: invite.invitedBy,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendInvite,
  acceptInvite,
  getInvites,
  cancelInvite,
  getInviteByToken,
};
