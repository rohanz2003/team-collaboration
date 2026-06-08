import { create } from 'zustand'
import { paymentApi } from '../api/payment'

const useSubscriptionStore = create((set, get) => ({
  plan: 'free',
  subscriptionStatus: null,
  aiQuota: { used: 0, limit: 50, resetAt: null },
  loading: false,
  error: null,

  fetchStatus: async () => {
    try {
      const { data } = await paymentApi.getSubscriptionStatus()
      set({
        plan: data.plan,
        subscriptionStatus: data.subscriptionStatus,
        aiQuota: data.aiQuota,
      })
    } catch {}
  },

  upgradeToPro: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await paymentApi.createCheckoutSession('pro')
      if (data.url) {
        window.location.href = data.url
      }
      set({ loading: false })
      return data
    } catch (err) {
      const message = err.response?.data?.message || 'Upgrade failed'
      set({ error: message, loading: false })
      throw err
    }
  },

  demoUpgrade: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await paymentApi.demoUpgrade()
      set({ plan: 'pro', subscriptionStatus: 'active', loading: false })
      return data
    } catch (err) {
      const message = err.response?.data?.message || 'Demo upgrade failed'
      set({ error: message, loading: false })
      throw err
    }
  },

  cancelSubscription: async () => {
    set({ loading: true, error: null })
    try {
      await paymentApi.cancelSubscription()
      set({ plan: 'free', subscriptionStatus: 'canceled', loading: false })
    } catch (err) {
      const message = err.response?.data?.message || 'Cancel failed'
      set({ error: message, loading: false })
    }
  },

  setPlan: (plan, status) => {
    set({ plan, subscriptionStatus: status })
  },

  isPro: () => get().plan === 'pro',
}))

export const usePlan = () => useSubscriptionStore((s) => s.plan)
export const useSubscriptionStatus = () => useSubscriptionStore((s) => s.subscriptionStatus)
export const useIsPro = () => useSubscriptionStore((s) => s.plan === 'pro' && s.subscriptionStatus === 'active')
export const useAIQuota = () => useSubscriptionStore((s) => s.aiQuota)

export default useSubscriptionStore
