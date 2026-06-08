const express = require('express');
const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
  deleteWorkspace,
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', protect, createWorkspace);
router.get('/my-workspaces', protect, getMyWorkspaces);
router.get('/:workspaceId/members', protect, getWorkspaceMembers);
router.put('/:workspaceId/role', protect, updateMemberRole);
router.delete('/:workspaceId/members/:userId', protect, removeMember);
router.delete('/:workspaceId', protect, deleteWorkspace);

module.exports = router;
