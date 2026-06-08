import api from './axios'

export const paymentApi = {
  createCheckoutSession: (plan) => api.post('/payment/create-checkout', { plan }),
  getSubscriptionStatus: () => api.get('/payment/status'),
  cancelSubscription: () => api.post('/payment/cancel'),
  demoUpgrade: () => api.post('/payment/demo-upgrade'),
}
