import { create } from 'zustand'

const useMessageStore = create((set, get) => ({
  editingId: null,
  editingText: '',
  replyToId: null,
  replyToData: null,
  searchQuery: '',
  searchResults: [],
  searching: false,
  threadParentId: null,
  threadReplies: [],

  setEditingId: (id) => set({ editingId: id }),
  setEditingText: (text) => set({ editingText: text }),

  startEditing: (msg) =>
    set({ editingId: msg._id, editingText: msg.text }),

  cancelEditing: () => set({ editingId: null, editingText: '' }),

  setReplyTo: (msg) =>
    set({ replyToId: msg?._id || null, replyToData: msg || null }),

  cancelReplyTo: () => set({ replyToId: null, replyToData: null }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSearching: (v) => set({ searching: v }),

  clearSearch: () =>
    set({ searchQuery: '', searchResults: [], searching: false }),

  setThreadParentId: (id) => set({ threadParentId: id }),
  setThreadReplies: (replies) => set({ threadReplies: replies }),

  addThreadReply: (reply) =>
    set((s) => ({
      threadReplies: s.threadReplies.some((r) => r._id === reply._id)
        ? s.threadReplies
        : [...s.threadReplies, reply],
    })),

  clearThread: () => set({ threadParentId: null, threadReplies: [] }),
}))

export const useEditingId = () => useMessageStore((s) => s.editingId)
export const useEditingText = () => useMessageStore((s) => s.editingText)
export const useReplyToData = () => [useMessageStore((s) => s.replyToId), useMessageStore((s) => s.replyToData)]
export const useSearchQuery = () => useMessageStore((s) => s.searchQuery)
export const useSearchResults = () => useMessageStore((s) => s.searchResults)
export const useSearching = () => useMessageStore((s) => s.searching)
export const useThreadParentId = () => useMessageStore((s) => s.threadParentId)
export const useThreadReplies = () => useMessageStore((s) => s.threadReplies)

export default useMessageStore
