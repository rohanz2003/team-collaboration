import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useCurrentWorkspace,
  useChannels,
  useCurrentChannel,
  useSetChannel,
  useCreateChannel,
  useCurrentUserRole,
  useDeleteChannel,
  useDeleteWorkspace,
  useLeaveWorkspace,
} from '../store/workspaceStore'
import { useAuth, useLogout } from '../store/authStore'
import { ROUTES } from '../constants/routes'
import NotificationBell from './NotificationBell'
import InviteUserModal from './InviteUserModal'
import RoleBadge from './RoleBadge'

const btnBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.15s', border: 'none',
}

const navBtn = {
  ...btnBase, width: '100%', justifyContent: 'flex-start', gap: 8,
  backgroundColor: 'transparent', color: '#8b949e', fontSize: 12,
  padding: '6px 10px', marginBottom: 4,
}

export default function WorkspaceSidebar() {
  const workspace = useCurrentWorkspace()
  const channels = useChannels()
  const currentChannel = useCurrentChannel()
  const setChannel = useSetChannel()
  const createChannel = useCreateChannel()
  const userRole = useCurrentUserRole()
  const { user } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()

  const [showInput, setShowInput] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const deleteChannel = useDeleteChannel()
  const deleteWorkspace = useDeleteWorkspace()
  const leaveWorkspace = useLeaveWorkspace()

  const isAdminOrOwner = userRole === 'owner' || userRole === 'admin'

  const handleCreateChannel = useCallback(async () => {
    if (!channelName.trim()) return
    try {
      const ch = await createChannel(channelName.trim())
      setChannelName('')
      setShowInput(false)
      if (ch) setChannel(ch)
    } catch {}
  }, [channelName, createChannel, setChannel])

  const handleLogout = useCallback(() => {
    logout()
    navigate(ROUTES.LOGIN)
  }, [logout, navigate])

  return (
    <div style={{
      width: 260, height: '100vh',
      backgroundColor: '#0d1117', color: '#c9d1d9',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      borderRight: '1px solid #21262d',
    }}>
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid #21262d',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="#8b949e">
                <path d="M2 1.75C2 .784 2.784 0 3.75 0h2.5C7.216 0 8 .784 8 1.75v2.5A1.75 1.75 0 0 1 6.25 6h-2.5A1.75 1.75 0 0 1 2 4.25Zm8 0C10 .784 10.784 0 11.75 0h2.5C15.216 0 16 .784 16 1.75v2.5A1.75 1.75 0 0 1 14.25 6h-2.5A1.75 1.75 0 0 1 10 4.25ZM2 9.75c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 6.25 14h-2.5A1.75 1.75 0 0 1 2 12.25Zm8 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 14.25 14h-2.5A1.75 1.75 0 0 1 10 12.25Z"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#e6edf3' }}>
                {workspace?.name || 'Workspace'}
              </span>
            </div>
            {workspace?.owner?.name && (
              <div style={{ fontSize: 11, color: '#8b949e', marginLeft: 22 }}>
                Created by {workspace.owner.name}
                {workspace.createdAt && ` · ${new Date(workspace.createdAt).toLocaleDateString()}`}
              </div>
            )}
          </div>
          <NotificationBell />
        </div>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #21262d' }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%', backgroundColor: '#0969da',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span style={{ fontSize: 12, color: '#c9d1d9', flex: 1 }}>{user?.name || 'User'}</span>
        {userRole && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#8b949e',
            padding: '2px 6px', borderRadius: 4,
            backgroundColor: 'rgba(139,148,158,0.1)', border: '1px solid rgba(139,148,158,0.2)',
            textTransform: 'capitalize',
          }}>
            {userRole}
          </span>
        )}
      </div>

      <div style={{
        padding: '10px 16px 6px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#8b949e',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Channels
        </span>
        {isAdminOrOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            style={{ ...btnBase, color: '#58a6ff', background: 'transparent', fontSize: 11, padding: '2px 8px' }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM7.5 5v2.5H5a.5.5 0 0 0 0 1h2.5V11a.5.5 0 0 0 1 0V8.5H11a.5.5 0 0 0 0-1H8.5V5a.5.5 0 0 0-1 0Z"/>
            </svg>
            Invite
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {channels.map((ch) => (
          <div
            key={ch._id}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '2px 2px 2px 10px', borderRadius: 6,
              cursor: 'pointer', marginBottom: 1,
              backgroundColor: currentChannel?._id === ch._id ? '#1c2128' : 'transparent',
              color: currentChannel?._id === ch._id ? '#e6edf3' : '#8b949e',
              fontSize: 13,
              transition: 'background-color 0.1s',
            }}
            onMouseEnter={(e) => { if (currentChannel?._id !== ch._id) e.currentTarget.style.backgroundColor = '#161b22' }}
            onMouseLeave={(e) => { if (currentChannel?._id !== ch._id) e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <div
              onClick={() => setChannel(ch)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M2.5 7.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0-6a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Z"/>
              </svg>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
            </div>
            {isAdminOrOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirmDeleteId === ch._id) {
                    deleteChannel(ch._id)
                    setConfirmDeleteId(null)
                  } else {
                    setConfirmDeleteId(ch._id)
                    setTimeout(() => setConfirmDeleteId(null), 3000)
                  }
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', background: 'transparent',
                  color: confirmDeleteId === ch._id ? '#f85149' : '#8b949e',
                  cursor: 'pointer', padding: '4px', borderRadius: 4,
                  fontSize: 11, fontWeight: 600, flexShrink: 0,
                  transition: 'color 0.1s',
                }}
                title={confirmDeleteId === ch._id ? 'Click again to confirm' : 'Delete channel'}
              >
                {confirmDeleteId === ch._id ? 'Confirm' : (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5h-.5l-.721 9.673A1.75 1.75 0 0 1 10.282 16H5.718a1.75 1.75 0 0 1-1.747-1.827L3.25 4.5h-.5a.75.75 0 0 1 0-1.5H5V1.75A1.75 1.75 0 0 1 6.75 0h2.5A1.75 1.75 0 0 1 11 1.75Z"/>
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 12px' }}>
        {showInput ? (
          <div style={{
            backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: 4,
            display: 'flex', gap: 4,
          }}>
            <input
              autoFocus
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateChannel()
                if (e.key === 'Escape') { setShowInput(false); setChannelName('') }
              }}
              onBlur={() => { setShowInput(false); setChannelName('') }}
              placeholder="Channel name"
              style={{
                flex: 1, padding: '6px 8px', borderRadius: 4,
                border: 'none', fontSize: 12, outline: 'none',
                backgroundColor: 'transparent', color: '#c9d1d9',
              }}
            />
            <button
              onClick={handleCreateChannel}
              style={{
                ...btnBase, padding: '4px 10px',
                backgroundColor: channelName.trim() ? '#238636' : '#21262d',
                color: channelName.trim() ? '#fff' : '#484f58',
                fontSize: 11,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
              </svg>
            </button>
          </div>
        ) : isAdminOrOwner && (
          <button
            onClick={() => setShowInput(true)}
            style={{
              ...btnBase, width: '100%', justifyContent: 'flex-start',
              backgroundColor: 'transparent', color: '#8b949e', fontSize: 12,
              padding: '6px 10px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#161b22' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/>
            </svg>
            Add channel
          </button>
        )}
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid #21262d' }}>
        <button
          onClick={() => navigate(ROUTES.WORKSPACES)}
          style={navBtn}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#161b22' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.22 8.03a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7h8.69a.75.75 0 0 1 0 1.5H4.56l3.22 3.22a.75.75 0 0 1 0 1.06Z"/>
          </svg>
          Workspaces
        </button>
        {userRole === 'owner' && (
          <button
            onClick={async () => {
              if (window.confirm(`Delete "${workspace?.name}" permanently? This action cannot be undone.`)) {
                await deleteWorkspace(workspace._id)
                navigate(ROUTES.WORKSPACES)
              }
            }}
            style={{ ...navBtn, color: '#f85149' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248,81,73,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5h-.5l-.721 9.673A1.75 1.75 0 0 1 10.282 16H5.718a1.75 1.75 0 0 1-1.747-1.827L3.25 4.5h-.5a.75.75 0 0 1 0-1.5H5V1.75A1.75 1.75 0 0 1 6.75 0h2.5A1.75 1.75 0 0 1 11 1.75ZM5.75 6.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z"/>
            </svg>
            Delete workspace
          </button>
        )}
        {userRole && userRole !== 'owner' && (
          <button
            onClick={async () => {
              if (window.confirm(`Leave "${workspace?.name}"? You can rejoin if invited again.`)) {
                await leaveWorkspace(workspace._id)
                navigate(ROUTES.WORKSPACES)
              }
            }}
            style={{ ...navBtn, color: '#f85149' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248,81,73,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06l1.97-1.97H6.75a.75.75 0 0 1 0-1.5h5.69Z"/>
            </svg>
            Leave workspace
          </button>
        )}
        <button
          onClick={handleLogout}
          style={navBtn}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#161b22' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06l1.97-1.97H6.75a.75.75 0 0 1 0-1.5h5.69Z"/>
          </svg>
          Sign out
        </button>
      </div>

      {showInviteModal && workspace && (
        <InviteUserModal
          workspaceId={workspace._id}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={() => {}}
        />
      )}
    </div>
  )
}
