import api from './axios'

export const messageApi = {
  getMessages: (channelId, params) => api.get(`/message/${channelId}`, { params }),
  searchMessages: (channelId, q) => api.get(`/message/${channelId}/search`, { params: { q } }),
  editMessage: (messageId, text) => api.put(`/message/${messageId}/edit`, { text }),
  deleteMessage: (messageId) => api.delete(`/message/${messageId}`),
  replyMessage: (messageId, text) => api.post(`/message/${messageId}/reply`, { text }),
  getReplies: (messageId) => api.get(`/message/${messageId}/replies`),
  toggleReaction: (messageId, type) => api.put(`/message/${messageId}/react`, { type }),
  markSeen: (channelId, messageIds) => api.post(`/message/${channelId}/seen`, { messageIds }),
}
