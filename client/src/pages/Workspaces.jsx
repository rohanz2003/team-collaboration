import { useEffect, useState, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'
import useWorkspaceStore, { useFetchWorkspaces, useWorkspaces, useWorkspaceLoading, useCreateWorkspace } from '../store/workspaceStore'
import RoleBadge from '../components/RoleBadge'
import NotificationBell from '../components/NotificationBell'
import { ROUTES } from '../constants/routes'

const COLORS = ['#0969da', '#1f883d', '#9a6700', '#cf222e', '#8250df', '#0550ae']

function WorkspaceCard({ ws, onSelect }) {
  const memberCount = ws.members?.length || 0
  const chCount = ws.channels?.length || 0
  const ownerName = ws.owner?.name || 'Unknown'
  const initials = ws.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || ws.name.substring(0, 2).toUpperCase()

  return (
    <div
      onClick={() => onSelect(ws)}
      style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        border: '1px solid #e1e4e8',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#0969da'
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(9,105,218,0.12), 0 4px 12px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e1e4e8'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS[Math.abs(hash(ws._id)) % COLORS.length]}, ${COLORS[Math.abs(hash(ws._id) + 2) % COLORS.length]})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: 0.3,
          }}>
            {initials}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0d1117', marginBottom: 2 }}>{ws.name}</div>
          <div style={{ fontSize: 12, color: '#656d76', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{ownerName}</span>
            <span style={{ color: '#d0d7de' }}>·</span>
            <span style={{ color: chCount > 0 ? '#0969da' : '#656d76' }}>{chCount} {chCount === 1 ? 'channel' : 'channels'}</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 12,
          paddingTop: 12,
          borderTop: '1px solid #f6f8fa',
          fontSize: 12,
          color: '#656d76',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM5.5 9c-2.7 0-5 1.3-5 3v1h10v-1c0-1.7-2.3-3-5-3Zm6-5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM16 12c0-1.7-2.3-3-5-3-.6 0-1.2.1-1.8.3.5.6.8 1.4.8 2.3v1h6v-.6Z"/></svg>
            {memberCount}
          </span>
        </div>
      </div>
    </div>
  )
}

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }
  return h
}

const MemoWorkspaceCard = memo(WorkspaceCard)

export default function Workspaces() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fetchWorkspaces = useFetchWorkspaces()
  const workspaces = useWorkspaces()
  const loading = useWorkspaceLoading()
  const createWorkspace = useCreateWorkspace()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => { fetchWorkspaces() }, [fetchWorkspaces])

  const handleSelect = useCallback(async (ws) => {
    useWorkspaceStore.getState().setWorkspace(ws)
    navigate(ROUTES.WORKSPACE_VIEW)
  }, [navigate])

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return
    try {
      const ws = await createWorkspace(name.trim())
      setName(''); setShowCreate(false)
      if (ws) handleSelect(ws)
    } catch {}
  }, [name, createWorkspace, handleSelect])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f8fa' }}>
      <Header
        user={user}
        title="Workspaces"
        onDashboard={() => navigate(ROUTES.DASHBOARD)}
      />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#0d1117',
              margin: '0 0 2px',
              letterSpacing: '-0.3px',
            }}>
              Workspaces
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#656d76' }}>
              {workspaces.length} total · {user?.name || 'User'}
            </p>
          </div>
          <button
            onClick={() => { setShowCreate(!showCreate); setName('') }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              borderRadius: 6,
              border: showCreate ? '1px solid #d0d7de' : 'none',
              backgroundColor: showCreate ? '#fff' : '#0969da',
              color: showCreate ? '#24292f' : '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s, border-color 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ transform: showCreate ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/>
            </svg>
            {showCreate ? 'Cancel' : 'New workspace'}
          </button>
        </div>

        {showCreate && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#fff',
            border: '1px solid #d0d7de',
            borderRadius: 10,
            marginBottom: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#f6f8fa',
                border: '1px solid #d0d7de',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#656d76',
                flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 1.75C2 .784 2.784 0 3.75 0h2.5C7.216 0 8 .784 8 1.75v2.5A1.75 1.75 0 0 1 6.25 6h-2.5A1.75 1.75 0 0 1 2 4.25Zm8 0C10 .784 10.784 0 11.75 0h2.5C15.216 0 16 .784 16 1.75v2.5A1.75 1.75 0 0 1 14.25 6h-2.5A1.75 1.75 0 0 1 10 4.25ZM2 9.75c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 6.25 14h-2.5A1.75 1.75 0 0 1 2 12.25Zm8 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 14.25 14h-2.5A1.75 1.75 0 0 1 10 12.25Z"/>
                </svg>
              </div>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false) }}
                placeholder="Enter workspace name..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d0d7de',
                  borderRadius: 6,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: name.trim() ? '#0969da' : '#d0d7de',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.15s',
                }}
              >
                Create
              </button>
            </div>
          </div>
        )}

        {workspaces.length === 0 && !loading ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {workspaces.map((ws) => (
              <MemoWorkspaceCard key={ws._id} ws={ws} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Header({ user, onDashboard }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid #d0d7de',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={onDashboard} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: '#0d1117',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 1.75C2 .784 2.784 0 3.75 0h2.5C7.216 0 8 .784 8 1.75v2.5A1.75 1.75 0 0 1 6.25 6h-2.5A1.75 1.75 0 0 1 2 4.25Zm8 0C10 .784 10.784 0 11.75 0h2.5C15.216 0 16 .784 16 1.75v2.5A1.75 1.75 0 0 1 14.25 6h-2.5A1.75 1.75 0 0 1 10 4.25ZM2 9.75c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 6.25 14h-2.5A1.75 1.75 0 0 1 2 12.25Zm8 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 14.25 14h-2.5A1.75 1.75 0 0 1 10 12.25Z"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#0d1117' }}>TeamCollab</span>
          </div>
          <div style={{ width: 1, height: 20, backgroundColor: '#d0d7de' }} />
          <span style={{ fontSize: 13, color: '#656d76' }}>Workspaces</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NotificationBell />
          <div
            onClick={onDashboard}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#0969da',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div style={{
      padding: '80px 32px',
      textAlign: 'center',
      backgroundColor: '#fff',
      border: '1px solid #d0d7de',
      borderRadius: 10,
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        backgroundColor: '#f6f8fa',
        border: '1px solid #d0d7de',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <svg width="32" height="32" viewBox="0 0 16 16" fill="#656d76">
          <path d="M2 1.75C2 .784 2.784 0 3.75 0h2.5C7.216 0 8 .784 8 1.75v2.5A1.75 1.75 0 0 1 6.25 6h-2.5A1.75 1.75 0 0 1 2 4.25Zm8 0C10 .784 10.784 0 11.75 0h2.5C15.216 0 16 .784 16 1.75v2.5A1.75 1.75 0 0 1 14.25 6h-2.5A1.75 1.75 0 0 1 10 4.25ZM2 9.75c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 6.25 14h-2.5A1.75 1.75 0 0 1 2 12.25Zm8 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 14.25 14h-2.5A1.75 1.75 0 0 1 10 12.25Z"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0d1117', margin: '0 0 6px' }}>No workspaces yet</h2>
      <p style={{ color: '#656d76', fontSize: 14, margin: '0 auto 24px', maxWidth: 380, lineHeight: 1.5 }}>
        Workspaces are where your team comes together. Create your first workspace to start collaborating in real-time.
      </p>
      <button
        onClick={onCreate}
        style={{
          padding: '10px 24px',
          borderRadius: 6,
          border: 'none',
          backgroundColor: '#0969da',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0550ae' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0969da' }}
      >
        Create workspace
      </button>
    </div>
  )
}
