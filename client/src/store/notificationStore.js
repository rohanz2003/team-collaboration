import { create } from 'zustand'
import { notificationApi } from '../api/notification'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  loading: false,
  error: null,

  fetchNotifications: async (page = 1) => {
    set({ loading: true, error: null })
    try {
      const { data } = await notificationApi.getNotifications({ page })
      set({
        notifications: data.notifications,
        total: data.total,
        unreadCount: data.unreadCount,
        loading: false,
      })
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to load notifications',
        loading: false,
      })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await notificationApi.getUnreadCount()
      set({ unreadCount: data.count })
    } catch {}
  },

  markAsRead: async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }))
    } catch {}
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  deleteNotification: async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId)
      set((state) => {
        const removed = state.notifications.find((n) => n._id === notificationId)
        return {
          notifications: state.notifications.filter((n) => n._id !== notificationId),
          unreadCount: removed && !removed.read ? state.unreadCount - 1 : state.unreadCount,
        }
      })
    } catch {}
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0, total: 0 })
  },
}))

export const useNotifications = () => useNotificationStore((s) => s.notifications)
export const useUnreadCount = () => useNotificationStore((s) => s.unreadCount)
export const useNotifLoading = () => useNotificationStore((s) => s.loading)

export default useNotificationStore
