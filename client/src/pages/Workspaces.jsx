import { useEffect, useState, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'
import {
  useFetchWorkspaces,
  useWorkspaces,
  useWorkspaceLoading,
  useCreateWorkspace,
} from '../store/workspaceStore'
import RoleBadge from '../components/RoleBadge'
import NotificationBell from '../components/NotificationBell'
import { ROUTES } from '../constants/routes'

const WS_COLORS = [
  { bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', light: '#eef2ff' },
  { bg: 'linear-gradient(135deg, #3b82f6, #06b6d4)', light: '#ecfeff' },
  { bg: 'linear-gradient(135deg, #10b981, #34d399)', light: '#ecfdf5' },
  { bg: 'linear-gradient(135deg, #f59e0b, #f97316)', light: '#fff7ed' },
  { bg: 'linear-gradient(135deg, #ef4444, #f43f5e)', light: '#fef2f2' },
  { bg: 'linear-gradient(135deg, #8b5cf6, #d946ef)', light: '#faf5ff' },
]

const WorkspaceCard = memo(function WorkspaceCard({ ws, onSelect, idx }) {
  const color = WS_COLORS[idx % WS_COLORS.length]
  const initials = ws.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
  const memberCount = ws.members?.length || 0
  const ownerName = ws.owner?.name || 'Unknown'
  const roleEl = ws.members?.find(
    (m) => m.role === 'owner' || m.role === 'admin'
  )

  return (
    <div
      onClick={() => onSelect(ws)}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        border: '1px solid #e9edf2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: color.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: 0.5,
        }}>
          {initials}
        </div>
        {roleEl && <RoleBadge role={roleEl.role} />}
      </div>
      <div style={{ padding: '12px 24px 20px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{ws.name}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>Created by {ownerName}</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14 }}>👤</span>
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14 }}>💬</span>
            <span>{ws.channels?.length || 0} channels</span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default function Workspaces() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fetchWorkspaces = useFetchWorkspaces()
  const workspaces = useWorkspaces()
  const loading = useWorkspaceLoading()
  const createWorkspace = useCreateWorkspace()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const handleSelect = useCallback(
    async (ws) => {
      const { useSetWorkspace } = await import('../store/workspaceStore')
      useSetWorkspace.getState().setWorkspace(ws)
      navigate(ROUTES.WORKSPACE_VIEW)
    },
    [navigate]
  )

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return
    try {
      const ws = await createWorkspace(name.trim())
      setName('')
      setShowCreate(false)
      if (ws) handleSelect(ws)
    } catch {}
  }, [name, createWorkspace, handleSelect])

  if (loading && workspaces.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ color: '#64748b', fontSize: 15 }}>Loading workspaces...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e9edf2',
        padding: '0 32px',
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              onClick={() => navigate(ROUTES.DASHBOARD)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
              }}>TC</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }}>TeamCollab</span>
            </div>
            <div style={{
              width: 1,
              height: 24,
              backgroundColor: '#e2e8f0',
              margin: '0 4px',
            }} />
            <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>Workspaces</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            <div
              onClick={() => navigate(ROUTES.DASHBOARD)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              Workspaces
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>
              {workspaces.length} {workspaces.length === 1 ? 'workspace' : 'workspaces'} · {user?.name || 'User'}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 18 }}>+</span>
            {showCreate ? 'Cancel' : 'New Workspace'}
          </button>
        </div>

        {showCreate && (
          <div style={{
            padding: '20px 24px',
            backgroundColor: '#fff',
            borderRadius: 14,
            border: '1px solid #e9edf2',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            marginBottom: 24,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#fff',
              flexShrink: 0,
            }}>🏢</div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Enter workspace name..."
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 15,
                outline: 'none',
              }}
            />
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: name.trim() ? '#10b981' : '#cbd5e0',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Create
            </button>
          </div>
        )}

        {workspaces.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#fff',
            borderRadius: 16,
            border: '1px solid #e9edf2',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏗️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' }}>Create your first workspace</h2>
            <p style={{ maxWidth: 400, margin: '0 auto 24px', color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
              Workspaces are where your team collaborates. Create one to start building channels, chatting, and sharing files.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '12px 32px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              }}
            >
              Create Workspace
            </button>
          </div>
        )}

        {workspaces.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {workspaces.map((ws, i) => (
              <WorkspaceCard key={ws._id} ws={ws} onSelect={handleSelect} idx={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
