import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnreadCount, useNotifications } from '../store/notificationStore'
import useNotificationStore from '../store/notificationStore'
import { getSocket } from '../socket'

export default function NotificationBell({ dark }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const unreadCount = useUnreadCount()
  const notifications = useNotifications()
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const addNotification = useNotificationStore((s) => s.addNotification)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => {
      useNotificationStore.getState().fetchUnreadCount()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const handler = (notification) => {
      addNotification(notification)
    }
    socket.on('new-notification', handler)
    return () => {
      socket.off('new-notification', handler)
    }
  }, [addNotification])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = useCallback(() => {
    if (!open) fetchNotifications()
    setOpen(!open)
  }, [open, fetchNotifications])

  const handleNotificationClick = useCallback(
    (notification) => {
      if (!notification.read) {
        markAsRead(notification._id)
      }
      if (notification.link) {
        navigate(notification.link)
      }
      setOpen(false)
    },
    [markAsRead, navigate]
  )

  const handleMarkAll = useCallback(() => {
    markAllAsRead()
  }, [markAllAsRead])

  const formatTime = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        style={{
          position: 'relative',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          fontSize: 20,
          padding: '4px 8px',
          color: dark ? '#656d76' : 'rgba(255,255,255,0.8)',
        }}
        title="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
          <path d="M224 0c-17.7 0-32 14.3-32 32l0 3.2C119 50 64 114.6 64 192l0 21.7c0 48.1-16.4 94.8-46.4 132.4L7.8 358.3C2.7 364.6 0 372.4 0 380.5 0 400.1 15.9 416 35.5 416l376.9 0c19.6 0 35.5-15.9 35.5-35.5 0-8.1-2.7-15.9-7.8-22.2l-9.8-12.2C400.4 308.5 384 261.8 384 213.7l0-21.7c0-77.4-55-142-128-156.8l0-3.2c0-17.7-14.3-32-32-32zM162 464c7.1 27.6 32.2 48 62 48s54.9-20.4 62-48l-124 0z"/>
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 2,
              backgroundColor: '#f85149',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            top: 56,
            right: 16,
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 420,
            backgroundColor: '#fff',
            border: '1px solid #e9edef',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 10000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid #e9edef',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111b21' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#075E54',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 && (
              <div
                style={{
                  padding: 32,
                  textAlign: 'center',
                  color: '#8696a0',
                  fontSize: 13,
                }}
              >
                No notifications yet
              </div>
            )}
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid #f0f2f5',
                  backgroundColor: n.read ? '#fff' : '#dcf8c6',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: n.read ? 400 : 600,
                        color: '#111b21',
                        marginBottom: 2,
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#667781',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {n.message}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#8696a0', whiteSpace: 'nowrap' }}>
                    {formatTime(n.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
