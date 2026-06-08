import api from './axios'

export const channelApi = {
  create: (data) => api.post('/channel/create', data),
  getByWorkspace: (workspaceId) => api.get(`/channel/${workspaceId}`),
  delete: (channelId) => api.delete(`/channel/${channelId}`),
}
