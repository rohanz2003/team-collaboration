import { io } from 'socket.io-client'

const RENDER_URL = 'https://team-collab-api-9yzu.onrender.com'

export const connectSocket = (token) => {
  if (window.__socket?.connected) return window.__socket

  const url = import.meta.env.VITE_SOCKET_URL || RENDER_URL

  window.__socket = io(url, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })

  window.__socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message)
  })

  return window.__socket
}

export const getSocket = () => window.__socket || null

export const disconnectSocket = () => {
  if (window.__socket) {
    window.__socket.disconnect()
    window.__socket = null
  }
}
