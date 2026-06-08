import { useEffect, useState, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'
import useWorkspaceStore, { useFetchWorkspaces, useWorkspaces, useWorkspaceLoading, useCreateWorkspace } from '../store/workspaceStore'
import RoleBadge from '../components/RoleBadge'
import NotificationBell from '../components/NotificationBell'
import { ROUTES } from '../constants/routes'

function WorkspaceCard({ ws, onSelect }) {
  const memberCount = ws.members?.length || 0
  const ownerName = ws.owner?.name || 'Unknown'
  const initials = ws.name.substring(0, 2).toUpperCase()

  return (
    <div
      onClick={() => onSelect(ws)}
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #d0d7de',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#0969da'
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(9,105,218,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#d0d7de'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: '#f6f8fa',
            border: '1px solid #d0d7de',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: '#24292f',
          }}>
            {initials}
          </div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#0d1117', marginBottom: 2 }}>{ws.name}</div>
        <div style={{ fontSize: 12, color: '#656d76', marginBottom: 12 }}>
          Created by {ownerName}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#656d76' }}>
          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          <span>{ws.channels?.length || 0} channels</span>
        </div>
      </div>
    </div>
  )
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

  if (loading && workspaces.length === 0) {
    return <PageLoading />
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f8fa' }}>
      <Header
        user={user}
        onDashboard={() => navigate(ROUTES.DASHBOARD)}
      />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0d1117', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              Workspaces
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#656d76' }}>
              {workspaces.length} total · {user?.name || 'User'}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#0969da',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showCreate ? 'Cancel' : 'New workspace'}
          </button>
        </div>

        {showCreate && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#fff',
            border: '1px solid #d0d7de',
            borderRadius: 8,
            marginBottom: 20,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Workspace name"
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
              }}
            >
              Create
            </button>
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
          <div
            onClick={onDashboard}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
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
            }}>TC</div>
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
      padding: '64px 32px',
      textAlign: 'center',
      backgroundColor: '#fff',
      border: '1px solid #d0d7de',
      borderRadius: 8,
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: '#f6f8fa',
        border: '1px solid #d0d7de',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        margin: '0 auto 16px',
        color: '#656d76',
      }}>
        #
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0d1117', margin: '0 0 6px' }}>No workspaces yet</h2>
      <p style={{ color: '#656d76', fontSize: 14, margin: '0 0 20px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
        Workspaces are where your team collaborates. Create one to get started with channels, chat, and file sharing.
      </p>
      <button
        onClick={onCreate}
        style={{
          padding: '8px 20px',
          borderRadius: 6,
          border: 'none',
          backgroundColor: '#0969da',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Create workspace
      </button>
    </div>
  )
}

function PageLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f6f8fa',
    }}>
      <div style={{ color: '#656d76', fontSize: 14 }}>Loading...</div>
    </div>
  )
}
