import { create } from 'zustand'
import { authApi } from '../api/auth'

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
}

const persistAuth = (data) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data))
}

const clearPersistedAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

const useAuthStore = create((set, get) => ({
  ...initialState,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authApi.login({ email, password })
      persistAuth(data)
      set({ user: data, token: data.token, loading: false })
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      set({ error: message, loading: false })
      throw err
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null })
    try {
      await authApi.register({ name, email, password })
      set({ loading: false })
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      set({ error: message, loading: false })
      throw err
    }
  },

  logout: () => {
    clearPersistedAuth()
    set({ user: null, token: null, error: null })
  },

  updateUser: (updates) => {
    const current = get().user
    if (!current) return
    const updated = { ...current, ...updates }
    localStorage.setItem('user', JSON.stringify(updated))
    set({ user: updated })
  },

  clearError: () => set({ error: null }),
}))

export const useAuth = () => useAuthStore((s) => ({ user: s.user, token: s.token, loading: s.loading, error: s.error }))
export const useLogin = () => useAuthStore((s) => s.login)
export const useRegister = () => useAuthStore((s) => s.register)
export const useLogout = () => useAuthStore((s) => s.logout)
export const useUpdateUser = () => useAuthStore((s) => s.updateUser)
export const useClearError = () => useAuthStore((s) => s.clearError)

export default useAuthStore
