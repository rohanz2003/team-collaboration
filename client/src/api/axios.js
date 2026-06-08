import axios from 'axios'

const toBaseUrl = (url) => {
  if (!url) return 'https://team-collab-api-9yzu.onrender.com/api'
  const s = url.replace(/\/+$/, '')
  return s.endsWith('/api') ? s : s + '/api'
}

const api = axios.create({
  baseURL: toBaseUrl(import.meta.env.VITE_API_URL),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    } else if (error.request) {
      return Promise.reject({
        response: {
          data: {
            message: `Cannot reach server. Make sure the backend is running at ${api.defaults.baseURL}`,
          },
        },
      })
    }
    return Promise.reject(error)
  }
)

export default api
