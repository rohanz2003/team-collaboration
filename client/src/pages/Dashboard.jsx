import { useEffect, useCallback, useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useLogout } from '../store/authStore'
import useWorkspaceStore, { useFetchWorkspaces, useWorkspaces, useWorkspaceLoading } from '../store/workspaceStore'
import { ROUTES } from '../constants/routes'

const linkClass = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 14px',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  border: '1px solid #d0d7de',
  backgroundColor: '#fff',
  color: '#24292f',
  textDecoration: 'none',
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: '20px 24px',
      border: '1px solid #d0d7de',
    }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#656d76', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: '#0d1117', letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#656d76', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

const MemoStat = memo(StatCard)

function WorkspaceRow({ ws, onSelect }) {
  const count = ws.members?.length || 0
  return (
    <div
      onClick={() => onSelect(ws)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        backgroundColor: '#fff',
        border: '1px solid #d0d7de',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0969da' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d0d7de' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          backgroundColor: '#f6f8fa',
          border: '1px solid #d0d7de',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 600,
          color: '#656d76',
        }}>
          #
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0d1117' }}>{ws.name}</div>
          <div style={{ fontSize: 12, color: '#656d76' }}>
            {ws.owner?.name || 'Unknown'} · {count} {count === 1 ? 'member' : 'members'}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 16, color: '#d0d7de' }}>→</div>
    </div>
  )
}

const MemoWorkspaceRow = memo(WorkspaceRow)

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()
  const fetchWorkspaces = useFetchWorkspaces()
  const workspaces = useWorkspaces()
  const wsLoading = useWorkspaceLoading()

  useEffect(() => { fetchWorkspaces() }, [fetchWorkspaces])

  const handleLogout = useCallback(() => { logout(); navigate(ROUTES.LOGIN) }, [logout, navigate])

  const handleSelect = useCallback(async (ws) => {
    useWorkspaceStore.getState().setWorkspace(ws)
    navigate(ROUTES.WORKSPACE_VIEW)
  }, [navigate])

  if (authLoading) return <PageLoading />
  if (!user) return <PageLoading msg="Please log in" />

  const totalChannels = workspaces.reduce((s, w) => s + (w.channels?.length || 0), 0)
  const totalMembers = [...new Set(workspaces.flatMap(w => w.members?.map(m => m.user?._id || m.user) || []))].length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f8fa' }}>
      <Header user={user} onLogout={handleLogout} onDashboard={() => {}} />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0d1117', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Overview
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#656d76' }}>
            {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} across your account
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
          <MemoStat label="Workspaces" value={workspaces.length} />
          <MemoStat label="Channels" value={totalChannels} />
          <MemoStat label="Team Members" value={totalMembers} />
          <MemoStat label="Plan" value={user.plan === 'pro' ? 'Pro' : 'Free'} sub={user.plan !== 'pro' ? 'Upgrade →' : 'Unlimited access'} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0d1117', margin: 0 }}>Workspaces</h2>
          <button onClick={() => navigate(ROUTES.WORKSPACES)} style={linkClass}>
            View all
          </button>
        </div>

        {wsLoading && workspaces.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#656d76', fontSize: 14 }}>Loading...</div>
        ) : workspaces.length === 0 ? (
          <div style={{
            padding: '48px 32px',
            textAlign: 'center',
            backgroundColor: '#fff',
            border: '1px solid #d0d7de',
            borderRadius: 8,
          }}>
            <p style={{ color: '#656d76', fontSize: 14, margin: '0 0 16px' }}>No workspaces yet</p>
            <button onClick={() => navigate(ROUTES.WORKSPACES)} style={{
              ...linkClass,
              backgroundColor: '#0969da',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
            }}>
              Create workspace
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workspaces.slice(0, 5).map((ws) => (
              <MemoWorkspaceRow key={ws._id} ws={ws} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Header({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

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

        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#0969da',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: '#24292f' }}>{user.name}</span>
          </div>

          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              backgroundColor: '#fff',
              border: '1px solid #d0d7de',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              minWidth: 180,
              zIndex: 200,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #f6f8fa' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0d1117' }}>{user.email}</div>
                <div style={{ fontSize: 11, color: '#656d76', marginTop: 2, textTransform: 'capitalize' }}>{user.plan || 'Free'} plan</div>
              </div>
              <div
                onClick={onLogout}
                style={{
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#cf222e',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PageLoading({ msg = 'Loading...' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f6f8fa',
    }}>
      <div style={{ color: '#656d76', fontSize: 14 }}>{msg}</div>
    </div>
  )
}
