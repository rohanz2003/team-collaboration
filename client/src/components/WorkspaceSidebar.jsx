import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useCurrentWorkspace,
  useChannels,
  useCurrentChannel,
  useSetChannel,
  useCreateChannel,
  useCurrentUserRole,
} from '../store/workspaceStore'
import { useAuth, useLogout } from '../store/authStore'
import { ROUTES } from '../constants/routes'
import NotificationBell from './NotificationBell'
import InviteUserModal from './InviteUserModal'
import RoleBadge from './RoleBadge'

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

  const isAdminOrOwner = userRole === 'owner' || userRole === 'admin'

  const handleCreateChannel = useCallback(async () => {
    if (!channelName.trim()) return
    try {
      const ch = await createChannel(channelName.trim())
      setChannelName('')
      setShowInput(false)
      if (ch) setChannel(ch)
    } catch {
    }
  }, [channelName, createChannel, setChannel])

  const handleLogout = useCallback(() => {
    logout()
    navigate(ROUTES.LOGIN)
  }, [logout, navigate])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') handleCreateChannel()
      if (e.key === 'Escape') { setShowInput(false); setChannelName('') }
    },
    [handleCreateChannel]
  )

  return (
    <div
      style={{
        width: 260,
        height: '100vh',
        backgroundColor: '#1a202c',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #2d3748',
          fontWeight: 700,
          fontSize: 16,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{workspace?.name || 'Workspace'}</span>
        <NotificationBell />
      </div>

      <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#718096' }}>
          {user?.name || 'User'}
        </span>
        {userRole && <RoleBadge role={userRole} />}
      </div>

      <div style={{ padding: '12px 20px', fontSize: 12, fontWeight: 600, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Channels</span>
        {isAdminOrOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: '#63b3ed',
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            + Invite
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {channels.map((ch) => (
          <div
            key={ch._id}
            onClick={() => setChannel(ch)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              backgroundColor: currentChannel?._id === ch._id ? '#2d3748' : 'transparent',
              color: currentChannel?._id === ch._id ? '#fff' : '#a0aec0',
              marginBottom: 2,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>#</span>
            {ch.name}
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 12px' }}>
        {showInput ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              autoFocus
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => { setShowInput(false); setChannelName('') }}
              placeholder="channel name"
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 4,
                border: 'none',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
        ) : (
          isAdminOrOwner && (
            <button
              onClick={() => setShowInput(true)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: 'transparent',
                color: '#a0aec0',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2d3748' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              + Add channel
            </button>
          )
        )}
      </div>

      <div style={{ padding: '12px 20px', borderTop: '1px solid #2d3748' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: 'transparent',
            color: '#fc8181',
            cursor: 'pointer',
            fontSize: 13,
            textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2d3748' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          Logout
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
