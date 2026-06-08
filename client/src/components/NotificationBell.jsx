import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnreadCount, useNotifications } from '../store/notificationStore'
import useNotificationStore from '../store/notificationStore'
import { getSocket } from '../socket'

export default function NotificationBell() {
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
          color: 'rgba(255,255,255,0.8)',
        }}
        title="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.5c-2.363 0-4 1.69-4 3.75v.562c0 .535-.176.984-.42 1.396l-.084.14c-.306.51-.664 1.118-.915 1.902-.126.395-.2.822-.2 1.292 0 .472.166.89.388 1.232.228.347.542.578.82.726.324.177.704.287 1.082.374.63.144 1.361.246 2.12.336.007.23.012.466-.003.703a.75.75 0 0 0 1.497.11c.018-.247.015-.487.011-.727.552-.068 1.087-.156 1.576-.278.47-.117.908-.267 1.27-.48.357-.212.64-.478.833-.834.197-.364.28-.782.28-1.262 0-.47-.074-.897-.2-1.292-.25-.784-.61-1.393-.916-1.902l-.083-.14c-.244-.412-.42-.861-.42-1.396V5.25c0-2.06-1.637-3.75-4-3.75ZM2.375 5.25c0-2.94 2.397-5.25 5.625-5.25s5.625 2.31 5.625 5.25v.562c0 .284.088.545.208.773l.084.14c.278.462.664 1.108.929 1.936.266.83.454 1.84.454 2.839 0 .757-.14 1.486-.531 2.101-.394.618-1.005 1.06-1.768 1.439-.668.332-1.484.54-2.435.716A21.95 21.95 0 0 1 8 15.5a21.96 21.96 0 0 1-2.591-.165c-.951-.177-1.767-.384-2.435-.716-.763-.38-1.374-.82-1.768-1.44-.39-.614-.531-1.343-.531-2.1 0-1 .188-2.01.454-2.839.265-.828.65-1.474.929-1.936l.084-.14a1.64 1.64 0 0 0 .208-.773V5.25Z"/>
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
