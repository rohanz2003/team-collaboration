import api from './axios'

export const callApi = {
  getHistory: (workspaceId, limit) => {
    const params = {}
    if (workspaceId) params.workspaceId = workspaceId
    if (limit) params.limit = limit
    return api.get('/call/history', { params })
  },
}
