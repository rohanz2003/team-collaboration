import { create } from 'zustand'
import { messageApi } from '../api/message'

const useChatStore = create((set, get) => ({
  messages: [],
  typingUsers: {},
  onlineUsers: [],
  loading: false,
  error: null,

  fetchMessages: async (channelId) => {
    if (!channelId) return
    set({ loading: true, error: null })
    try {
      const { data } = await messageApi.getMessages(channelId)
      set({ messages: data.messages, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load messages', loading: false })
    }
  },

  addMessage: (message) => {
    set((state) => {
      const exists = state.messages.some((m) => m._id === message._id)
      if (exists) return state
      return { messages: [...state.messages, message] }
    })
  },

  updateMessage: (updatedMessage) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === updatedMessage._id ? { ...m, ...updatedMessage } : m
      ),
    }))
  },

  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId
          ? { ...m, deleted: true, text: '', fileUrl: null, fileName: null, fileType: null }
          : m
      ),
    }))
  },

  setTyping: (channelId, user) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [channelId]: { ...state.typingUsers[channelId], [user._id]: user },
      },
    }))
  },

  clearTyping: (channelId, userId) => {
    set((state) => {
      const channelTyping = { ...state.typingUsers[channelId] }
      delete channelTyping[userId]
      return { typingUsers: { ...state.typingUsers, [channelId]: channelTyping } }
    })
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users })
  },

  clearChat: () => {
    set({ messages: [], typingUsers: {}, onlineUsers: [], error: null })
  },
}))

export const useMessages = () => useChatStore((s) => s.messages)
export const useTypingUsers = () => useChatStore((s) => s.typingUsers)
export const useOnlineUsers = () => useChatStore((s) => s.onlineUsers)
export const useChatLoading = () => useChatStore((s) => s.loading)
export const useFetchMessages = () => useChatStore((s) => s.fetchMessages)
export const useAddMessage = () => useChatStore((s) => s.addMessage)
export const useUpdateMessage = () => useChatStore((s) => s.updateMessage)
export const useRemoveMessage = () => useChatStore((s) => s.removeMessage)
export const useSetTyping = () => useChatStore((s) => s.setTyping)
export const useClearTyping = () => useChatStore((s) => s.clearTyping)
export const useSetOnlineUsers = () => useChatStore((s) => s.setOnlineUsers)
export const useClearChat = () => useChatStore((s) => s.clearChat)

export default useChatStore
