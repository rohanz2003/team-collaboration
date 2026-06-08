import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'
import {
  useFetchWorkspaces,
  useWorkspaces,
  useWorkspaceLoading,
  useSetWorkspace,
  useCreateWorkspace,
} from '../store/workspaceStore'
import RoleBadge from '../components/RoleBadge'
import NotificationBell from '../components/NotificationBell'
import { ROUTES } from '../constants/routes'

export default function Workspaces() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fetchWorkspaces = useFetchWorkspaces()
  const workspaces = useWorkspaces()
  const loading = useWorkspaceLoading()
  const setWorkspace = useSetWorkspace()
  const createWorkspace = useCreateWorkspace()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const handleSelect = useCallback(
    async (ws) => {
      await setWorkspace(ws)
      navigate(ROUTES.WORKSPACE_VIEW)
    },
    [setWorkspace, navigate]
  )

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return
    try {
      const ws = await createWorkspace(name.trim())
      setName('')
      setShowCreate(false)
      if (ws) handleSelect(ws)
    } catch {
    }
  }, [name, createWorkspace, handleSelect])

  const getUserRole = (workspace) => {
    const member = workspace.members?.find(
      (m) => m.user?._id === user?._id || m.user === user?._id
    )
    return member?.role || 'member'
  }

  if (loading && workspaces.length === 0) {
    return <div style={{ textAlign: 'center', marginTop: 80, color: '#718096' }}>Loading workspaces...</div>
  }

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a202c', margin: 0 }}>Workspaces</h1>
          <p style={{ margin: '4px 0 0', color: '#718096', fontSize: 14 }}>
            {user?.name || 'User'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <NotificationBell />
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#3182ce',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showCreate ? 'Cancel' : 'New Workspace'}
          </button>
        </div>
      </div>

      {showCreate && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 24,
            padding: 16,
            backgroundColor: '#fff',
            borderRadius: 10,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Workspace name"
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid #cbd5e0',
              borderRadius: 6,
              fontSize: 15,
              outline: 'none',
            }}
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: name.trim() ? '#48bb78' : '#cbd5e0',
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
        <p style={{ color: '#a0aec0', fontSize: 16, textAlign: 'center', marginTop: 60 }}>
          No workspaces yet. Create one to get started.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {workspaces.map((ws) => {
          const role = getUserRole(ws)
          return (
            <div
              key={ws._id}
              onClick={() => handleSelect(ws)}
              style={{
                padding: '18px 24px',
                backgroundColor: '#fff',
                borderRadius: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s, transform 0.15s',
                border: '1px solid #e2e8f0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: '0 0 4px', color: '#1a202c', fontSize: 18 }}>{ws.name}</h3>
                    <RoleBadge role={role} />
                  </div>
                  <p style={{ margin: 0, color: '#718096', fontSize: 13 }}>
                    Owner: {ws.owner?.name || 'Unknown'} &middot; Members: {ws.members?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
