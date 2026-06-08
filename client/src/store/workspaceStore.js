import { create } from 'zustand'
import { workspaceApi } from '../api/workspace'
import { channelApi } from '../api/channel'
import useAuthStore from './authStore'

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  channels: [],
  currentChannel: null,
  members: [],
  currentUserRole: null,
  loading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await workspaceApi.getMyWorkspaces()
      set({ workspaces: data, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load workspaces', loading: false })
    }
  },

  createWorkspace: async (name) => {
    set({ loading: true, error: null })
    try {
      const { data } = await workspaceApi.create({ name })
      set((state) => ({ workspaces: [...state.workspaces, data], loading: false }))
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create workspace', loading: false })
      throw err
    }
  },

  setWorkspace: async (workspace) => {
    const userId = useAuthStore.getState().user?._id
    const role = workspace.members?.find(
      (m) => m.user?._id === userId || m.user === userId
    )?.role || 'member'

    set({
      currentWorkspace: workspace,
      currentChannel: null,
      channels: [],
      members: workspace.members || [],
      currentUserRole: role,
      loading: true,
    })
    try {
      const { data } = await channelApi.getByWorkspace(workspace._id)
      set({ channels: data, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load channels', loading: false })
    }
  },

  refreshMembers: async () => {
    const { currentWorkspace } = get()
    if (!currentWorkspace) return
    try {
      const { data } = await workspaceApi.getMembers(currentWorkspace._id)
      set({ members: data.members || [] })
    } catch {}
  },

  createChannel: async (name) => {
    const { currentWorkspace } = get()
    if (!currentWorkspace) return
    set({ loading: true, error: null })
    try {
      const { data } = await channelApi.create({ name, workspaceId: currentWorkspace._id })
      set((state) => ({ channels: [...state.channels, data], loading: false }))
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create channel', loading: false })
      throw err
    }
  },

  setChannel: (channel) => {
    set({ currentChannel: channel })
  },

  setCurrentUserRole: (role) => {
    set({ currentUserRole: role })
  },

  deleteChannel: async (channelId) => {
    try {
      await channelApi.delete(channelId)
      set((state) => ({
        channels: state.channels.filter((ch) => ch._id !== channelId),
        currentChannel: state.currentChannel?._id === channelId ? null : state.currentChannel,
      }))
    } catch (err) {
      throw err
    }
  },

  deleteWorkspace: async (workspaceId) => {
    try {
      await workspaceApi.deleteWorkspace(workspaceId)
      set((state) => ({
        workspaces: state.workspaces.filter((ws) => ws._id !== workspaceId),
        currentWorkspace: state.currentWorkspace?._id === workspaceId ? null : state.currentWorkspace,
        channels: state.currentWorkspace?._id === workspaceId ? [] : state.channels,
        currentChannel: state.currentWorkspace?._id === workspaceId ? null : state.currentChannel,
        members: state.currentWorkspace?._id === workspaceId ? [] : state.members,
        currentUserRole: state.currentWorkspace?._id === workspaceId ? null : state.currentUserRole,
      }))
    } catch (err) {
      throw err
    }
  },

  leaveWorkspace: async (workspaceId) => {
    try {
      await workspaceApi.leaveWorkspace(workspaceId)
      set((state) => ({
        workspaces: state.workspaces.filter((ws) => ws._id !== workspaceId),
        currentWorkspace: state.currentWorkspace?._id === workspaceId ? null : state.currentWorkspace,
        channels: state.currentWorkspace?._id === workspaceId ? [] : state.channels,
        currentChannel: state.currentWorkspace?._id === workspaceId ? null : state.currentChannel,
        members: state.currentWorkspace?._id === workspaceId ? [] : state.members,
        currentUserRole: state.currentWorkspace?._id === workspaceId ? null : state.currentUserRole,
      }))
    } catch (err) {
      throw err
    }
  },

  clearWorkspace: () => {
    set({
      workspaces: [],
      currentWorkspace: null,
      channels: [],
      currentChannel: null,
      members: [],
      currentUserRole: null,
    })
  },
}))

export const useWorkspaces = () => useWorkspaceStore((s) => s.workspaces)
export const useCurrentWorkspace = () => useWorkspaceStore((s) => s.currentWorkspace)
export const useChannels = () => useWorkspaceStore((s) => s.channels)
export const useCurrentChannel = () => useWorkspaceStore((s) => s.currentChannel)
export const useMembers = () => useWorkspaceStore((s) => s.members)
export const useCurrentUserRole = () => useWorkspaceStore((s) => s.currentUserRole)
export const useWorkspaceLoading = () => useWorkspaceStore((s) => s.loading)
export const useWorkspaceError = () => useWorkspaceStore((s) => s.error)
export const useSetWorkspace = () => useWorkspaceStore((s) => s.setWorkspace)
export const useSetChannel = () => useWorkspaceStore((s) => s.setChannel)
export const useCreateWorkspace = () => useWorkspaceStore((s) => s.createWorkspace)
export const useCreateChannel = () => useWorkspaceStore((s) => s.createChannel)
export const useFetchWorkspaces = () => useWorkspaceStore((s) => s.fetchWorkspaces)
export const useClearWorkspace = () => useWorkspaceStore((s) => s.clearWorkspace)
export const useRefreshMembers = () => useWorkspaceStore((s) => s.refreshMembers)
export const useDeleteChannel = () => useWorkspaceStore((s) => s.deleteChannel)
export const useDeleteWorkspace = () => useWorkspaceStore((s) => s.deleteWorkspace)
export const useLeaveWorkspace = () => useWorkspaceStore((s) => s.leaveWorkspace)

export default useWorkspaceStore
