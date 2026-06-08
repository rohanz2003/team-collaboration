import api from './axios'

export const aiApi = {
  askAI: (question, channelId, workspaceId) => api.post('/ai/ask', { question, channelId, workspaceId }),
  summarizeChannel: (channelId) => api.get(`/ai/summarize/${channelId}`),
  summarizeWorkspace: (workspaceId) => api.get(`/ai/summarize-workspace/${workspaceId}`),
  getActionItems: (channelId) => api.get(`/ai/actions/${channelId}`),
  semanticSearch: (channelId, query) =>
    api.get(`/ai/semantic-search/${channelId}`, { params: { q: query } }),
}
