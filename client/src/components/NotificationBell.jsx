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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C10.3 2 9 3.3 9 5v1.2c0 .6-.3 1.2-.7 1.7l-.7.9c-.5.7-.8 1.6-.8 2.5 0 .7.1 1.4.5 2 .4.6 1 1.1 1.8 1.4 1.3.5 3.1.9 5.2.9s3.9-.4 5.2-.9c.8-.3 1.4-.8 1.8-1.4.3-.6.5-1.3.5-2 0-.9-.3-1.8-.8-2.5l-.7-.9c-.4-.5-.7-1.1-.7-1.7V5c0-1.7-1.3-3-3-3h-3Zm0 2h3c.5 0 1 .5 1 1v1.2c0 .9.4 1.7.9 2.4l.7.9c.3.4.5.9.5 1.4 0 .4-.1.8-.3 1.1-.2.3-.5.6-1 .8-1 .4-2.4.7-4.1.7s-3.1-.3-4.1-.7c-.4-.2-.8-.5-1-.8-.2-.3-.3-.7-.3-1.1 0-.5.2-1 .5-1.4l.7-.9C8.6 9.9 9 9.1 9 8.2V7c0-.5.5-1 1-1h3Z"/>
          <path d="M9.5 17.5c0 .7.5 1.5 1.2 1.8.4.2.9.2 1.3 0 .7-.3 1.2-1.1 1.2-1.8"/>
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
