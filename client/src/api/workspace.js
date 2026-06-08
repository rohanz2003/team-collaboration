import api from './axios'

export const workspaceApi = {
  create: (data) => api.post('/workspace/create', data),
  getMyWorkspaces: () => api.get('/workspace/my-workspaces'),
  getMembers: (workspaceId) => api.get(`/workspace/${workspaceId}/members`),
  updateMemberRole: (workspaceId, userId, role) =>
    api.put(`/workspace/${workspaceId}/role`, { userId, role }),
  removeMember: (workspaceId, userId) =>
    api.delete(`/workspace/${workspaceId}/members/${userId}`),
  deleteWorkspace: (workspaceId) => api.delete(`/workspace/${workspaceId}`),
}
