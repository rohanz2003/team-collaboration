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

const WA_TEAL = '#075E54'
const WA_GREEN = '#25D366'
const WA_BG = '#efeae2'

const btnBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.15s', border: 'none',
}

const navBtn = {
  ...btnBase, width: '100%', justifyContent: 'flex-start', gap: 8,
  backgroundColor: 'transparent', color: '#667781', fontSize: 12,
  padding: '8px 12px', marginBottom: 2, borderRadius: 0,
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
  const [search, setSearch] = useState('')

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

  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      width: 300, height: '100vh',
      backgroundColor: '#fff', color: '#111b21',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      borderRight: '1px solid #e9edef',
    }}>
      <div style={{
        backgroundColor: WA_TEAL, padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        minHeight: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="#ffffff">
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h2.5C7.216 0 8 .784 8 1.75v2.5A1.75 1.75 0 0 1 6.25 6h-2.5A1.75 1.75 0 0 1 2 4.25Zm8 0C10 .784 10.784 0 11.75 0h2.5C15.216 0 16 .784 16 1.75v2.5A1.75 1.75 0 0 1 14.25 6h-2.5A1.75 1.75 0 0 1 10 4.25ZM2 9.75c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 6.25 14h-2.5A1.75 1.75 0 0 1 2 12.25Zm8 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 14.25 14h-2.5A1.75 1.75 0 0 1 10 12.25Z"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: 16, color: '#ffffff' }}>
            {workspace?.name || 'Workspace'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isAdminOrOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                color: '#fff', cursor: 'pointer', padding: '6px 10px',
                borderRadius: 6, fontSize: 12, fontWeight: 600,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM7.5 5v2.5H5a.5.5 0 0 0 0 1h2.5V11a.5.5 0 0 0 1 0V8.5H11a.5.5 0 0 0 0-1H8.5V5a.5.5 0 0 0-1 0Z"/>
              </svg>
            </button>
          )}
          <NotificationBell />
        </div>
      </div>

      <div style={{ padding: '7px 12px', backgroundColor: '#fff' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          backgroundColor: '#f0f2f5', borderRadius: 8, padding: '6px 10px',
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#667781">
            <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start new chat"
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: 13, outline: 'none', color: '#111b21',
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff' }}>
        {filteredChannels.map((ch, idx) => (
          <div
            key={ch._id}
            onClick={() => setChannel(ch)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px', cursor: 'pointer',
              backgroundColor: currentChannel?._id === ch._id ? '#f0f2f5' : '#fff',
              borderBottom: idx < filteredChannels.length - 1 ? '1px solid #f0f2f5' : 'none',
              transition: 'background-color 0.1s',
            }}
            onMouseEnter={(e) => { if (currentChannel?._id !== ch._id) e.currentTarget.style.backgroundColor = '#f5f6f6' }}
            onMouseLeave={(e) => { if (currentChannel?._id !== ch._id) e.currentTarget.style.backgroundColor = '#fff' }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              backgroundColor: WA_TEAL,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16, fontWeight: 600, flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.5 7.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0-6a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Z"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#111b21' }}># {ch.name}</span>
              </div>
              <div style={{ fontSize: 12, color: '#667781', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Click to open channel
              </div>
            </div>
            {isAdminOrOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirmDeleteId === ch._id) { deleteChannel(ch._id); setConfirmDeleteId(null) }
                  else { setConfirmDeleteId(ch._id); setTimeout(() => setConfirmDeleteId(null), 3000) }
                }}
                style={{
                  background: 'transparent', border: 'none',
                  color: confirmDeleteId === ch._id ? '#f85149' : '#8696a0',
                  cursor: 'pointer', padding: '6px', borderRadius: '50%',
                  fontSize: 11, fontWeight: 600,
                  transition: 'background-color 0.1s',
                }}
                title={confirmDeleteId === ch._id ? 'Click again to confirm' : 'Delete channel'}
              >
                {confirmDeleteId === ch._id ? (
                  <span style={{ color: '#f85149', fontSize: 11, fontWeight: 600 }}>Confirm</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5h-.5l-.721 9.673A1.75 1.75 0 0 1 10.282 16H5.718a1.75 1.75 0 0 1-1.747-1.827L3.25 4.5h-.5a.75.75 0 0 1 0-1.5H5V1.75A1.75 1.75 0 0 1 6.75 0h2.5A1.75 1.75 0 0 1 11 1.75Z"/>
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '6px 12px', backgroundColor: '#f0f2f5', borderTop: '1px solid #e9edef' }}>
        {showInput ? (
          <div style={{
            backgroundColor: '#fff', border: '1px solid #e9edef', borderRadius: 8, padding: 4,
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
              placeholder="Channel name"
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 6,
                border: 'none', fontSize: 13, outline: 'none',
                backgroundColor: '#fff', color: '#111b21',
              }}
            />
            <button
              onClick={handleCreateChannel}
              style={{
                ...btnBase, padding: '4px 12px',
                backgroundColor: channelName.trim() ? WA_GREEN : '#e9edef',
                color: channelName.trim() ? '#fff' : '#8696a0',
                fontSize: 12,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
              </svg>
            </button>
            <button
              onClick={() => { setShowInput(false); setChannelName('') }}
              style={{
                ...btnBase, padding: '4px 8px',
                backgroundColor: 'transparent', color: '#8696a0',
                fontSize: 11,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z"/>
              </svg>
            </button>
          </div>
        ) : isAdminOrOwner && (
          <button
            onClick={() => setShowInput(true)}
            style={{
              ...btnBase, width: '100%', justifyContent: 'flex-start', gap: 8,
              backgroundColor: '#fff', color: '#667781', fontSize: 13,
              padding: '8px 12px', border: '1px solid #e9edef', borderRadius: 8,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f6f6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/>
            </svg>
            Add channel
          </button>
        )}
      </div>

      <div style={{ backgroundColor: '#f0f2f5', borderTop: '1px solid #e9edef' }}>
        <button
          onClick={() => navigate(ROUTES.WORKSPACES)}
          style={navBtn}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e9edef' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#667781">
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
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fce8e6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
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
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fce8e6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06l1.97-1.97H6.75a.75.75 0 0 1 0-1.5h5.69Z"/>
            </svg>
            Leave workspace
          </button>
        )}
        <button
          onClick={handleLogout}
          style={navBtn}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e9edef' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#667781">
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
