import { useEffect, useState, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'
import useWorkspaceStore, { useFetchWorkspaces, useWorkspaces, useWorkspaceLoading, useCreateWorkspace } from '../store/workspaceStore'
import RoleBadge from '../components/RoleBadge'
import NotificationBell from '../components/NotificationBell'
import { ROUTES } from '../constants/routes'

const PRIMARY = '#6366f1'
const PRIMARY_DARK = '#4f46e5'
const PRIMARY_GRADIENT = 'linear-gradient(135deg, #6366f1, #8b5cf6)'
const BG_GRADIENT = 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f0ff 100%)'
const TEXT_PRIMARY = '#1a1a2e'
const TEXT_SECONDARY = '#475569'
const TEXT_MUTED = '#64748b'
const BORDER = '#e9edf2'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#6366f1', '#8b5cf6']

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
        borderRadius: 12,
        border: '1px solid #e1e4e8',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = PRIMARY
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15), 0 4px 12px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e1e4e8'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ padding: '20px 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${COLORS[Math.abs(hash(ws._id)) % COLORS.length]}, ${COLORS[(Math.abs(hash(ws._id)) + 2) % COLORS.length]})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: 0.3,
          }}>
            {initials}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: PRIMARY, marginBottom: 2 }}>{ws.name}</div>
          <div style={{ fontSize: 12, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{ownerName}</span>
            <span style={{ color: BORDER }}>·</span>
            <span style={{ color: chCount > 0 ? PRIMARY : TEXT_MUTED }}>{chCount} {chCount === 1 ? 'channel' : 'channels'}</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 12,
          paddingTop: 10,
          borderTop: '1px solid #f0f0f0',
          fontSize: 12,
          color: TEXT_MUTED,
          flexWrap: 'wrap',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill={PRIMARY}><path d="M5.5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM5.5 9c-2.7 0-5 1.3-5 3v1h10v-1c0-1.7-2.3-3-5-3Zm6-5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM16 12c0-1.7-2.3-3-5-3-.6 0-1.2.1-1.8.3.5.6.8 1.4.8 2.3v1h6v-.6Z"/></svg>
            {memberCount} members
          </span>
          {ws.members?.slice(0, 4).map((m) => (
            <span key={m.user?._id || m.user} style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '1px 6px', borderRadius: 4,
              backgroundColor: '#eef2ff', color: PRIMARY,
              fontSize: 11,
            }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill={PRIMARY}>
                <path d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 7A3.5 3.5 0 0 0 4.5 12v.5c0 .28.22.5.5.5h6c.28 0 .5-.22.5-.5V12A3.5 3.5 0 0 0 8 8Z"/>
              </svg>
              {m.user?.name || 'Unknown'}
            </span>
          ))}
          {ws.members?.length > 4 && (
            <span style={{ color: '#8b949e', fontSize: 11 }}>+{ws.members.length - 4}</span>
          )}
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
    <div style={{ minHeight: '100vh', background: BG_GRADIENT }}>
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
              color: WHATSAPP_TEAL,
              margin: '0 0 2px',
              letterSpacing: '-0.3px',
            }}>
              Workspaces
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED }}>
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
              borderRadius: 8,
              border: showCreate ? '1px solid #d0d7de' : 'none',
              backgroundColor: showCreate ? '#fff' : PRIMARY,
              color: showCreate ? TEXT_PRIMARY : '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { if (!showCreate) e.currentTarget.style.backgroundColor = PRIMARY_DARK }}
            onMouseLeave={(e) => { if (!showCreate) e.currentTarget.style.backgroundColor = PRIMARY }}
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
            borderRadius: 12,
            marginBottom: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: PRIMARY_GRADIENT,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
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
                  backgroundColor: name.trim() ? PRIMARY : '#d0d7de',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => { if (name.trim()) e.currentTarget.style.backgroundColor = PRIMARY_DARK }}
                onMouseLeave={(e) => { if (name.trim()) e.currentTarget.style.backgroundColor = PRIMARY }}
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
      background: PRIMARY_GRADIENT,
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
              backgroundColor: 'rgba(255,255,255,0.2)',
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
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>TeamCollab</span>
          </div>
          <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.25)' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Workspaces</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NotificationBell />
          <div
            onClick={onDashboard}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: PRIMARY,
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
      borderRadius: 12,
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: PRIMARY_GRADIENT,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <svg width="32" height="32" viewBox="0 0 16 16" fill={'#fff'}>
          <path d="M2 1.75C2 .784 2.784 0 3.75 0h2.5C7.216 0 8 .784 8 1.75v2.5A1.75 1.75 0 0 1 6.25 6h-2.5A1.75 1.75 0 0 1 2 4.25Zm8 0C10 .784 10.784 0 11.75 0h2.5C15.216 0 16 .784 16 1.75v2.5A1.75 1.75 0 0 1 14.25 6h-2.5A1.75 1.75 0 0 1 10 4.25ZM2 9.75c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 6.25 14h-2.5A1.75 1.75 0 0 1 2 12.25Zm8 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 14.25 14h-2.5A1.75 1.75 0 0 1 10 12.25Z"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: PRIMARY, margin: '0 0 6px' }}>No workspaces yet</h2>
      <p style={{ color: TEXT_MUTED, fontSize: 14, margin: '0 auto 24px', maxWidth: 380, lineHeight: 1.5 }}>
        Workspaces are where your team comes together. Create your first workspace to start collaborating in real-time.
      </p>
      <button
        onClick={onCreate}
        style={{
          padding: '10px 24px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: PRIMARY,
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = WHATSAPP_GREEN_DARK }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = WHATSAPP_GREEN }}
      >
        Create workspace
      </button>
    </div>
  )
}
