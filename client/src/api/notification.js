import api from './axios'

export const notificationApi = {
  getNotifications: (params) => api.get('/notification', { params }),
  getUnreadCount: () => api.get('/notification/unread-count'),
  markAsRead: (notificationId) => api.put(`/notification/${notificationId}/read`),
  markAllAsRead: () => api.put('/notification/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notification/${notificationId}`),
}
