import api from './axios'

export const inviteApi = {
  sendInvite: (workspaceId, email) => api.post(`/invite/${workspaceId}`, { email }),
  acceptInvite: (token) => api.post('/invite/accept', { token }),
  getInvites: (workspaceId) => api.get(`/invite/${workspaceId}`),
  cancelInvite: (inviteId) => api.delete(`/invite/${inviteId}`),
  getInviteByToken: (token) => api.get(`/invite/token/${token}`),
}
