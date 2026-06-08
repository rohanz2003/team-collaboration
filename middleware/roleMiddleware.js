const Workspace = require('../models/Workspace');

const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const workspaceId =
        req.params.workspaceId ||
        req.body.workspaceId ||
        req.query.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({ message: 'Workspace ID required' });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      const userRole = workspace.getUserRole(req.user._id);
      if (!userRole) {
        return res.status(403).json({ message: 'Not a workspace member' });
      }

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          message: `Requires one of roles: ${roles.join(', ')}`,
        });
      }

      req.workspace = workspace;
      req.userRole = userRole;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

const requireWorkspaceMember = async (req, res, next) => {
  try {
    const workspaceId =
      req.params.workspaceId ||
      req.body.workspaceId ||
      req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const userRole = workspace.getUserRole(req.user._id);
    if (!userRole) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    req.workspace = workspace;
    req.userRole = userRole;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { requireRole, requireWorkspaceMember };
