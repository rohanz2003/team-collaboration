import { useEffect, useCallback, useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useLogout } from '../store/authStore'
import useWorkspaceStore, { useFetchWorkspaces, useWorkspaces, useWorkspaceLoading } from '../store/workspaceStore'
import { ROUTES } from '../constants/routes'

const linkS = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
  borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  border: '1px solid #d0d7de', backgroundColor: '#fff', color: '#24292f',
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 8, padding: '20px 24px',
      border: '1px solid #e1e4e8',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          backgroundColor: '#f6f8fa', border: '1px solid #d0d7de',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#656d76',
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: '#0d1117', letterSpacing: '-0.5px', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#656d76' }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: '#0969da', marginTop: 6, cursor: 'pointer' }}>{sub}</div>}
    </div>
  )
}

const MemoStat = memo(StatCard)

function WorkspaceRow({ ws, onSelect, userId }) {
  const count = ws.members?.length || 0
  const chCount = ws.channels?.length || 0
  const isOwner = ws.owner?._id === userId
  return (
    <div
      onClick={() => onSelect(ws)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', backgroundColor: '#fff',
        border: '1px solid #e1e4e8', borderRadius: 8, cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0969da'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(9,105,218,0.1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e1e4e8'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          backgroundColor: '#f6f8fa', border: '1px solid #d0d7de',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#656d76">
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h2.5C7.216 0 8 .784 8 1.75v2.5A1.75 1.75 0 0 1 6.25 6h-2.5A1.75 1.75 0 0 1 2 4.25Zm8 0C10 .784 10.784 0 11.75 0h2.5C15.216 0 16 .784 16 1.75v2.5A1.75 1.75 0 0 1 14.25 6h-2.5A1.75 1.75 0 0 1 10 4.25ZM2 9.75c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 6.25 14h-2.5A1.75 1.75 0 0 1 2 12.25Zm8 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 14.25 14h-2.5A1.75 1.75 0 0 1 10 12.25Z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0d1117' }}>{ws.name}</div>
          <div style={{ fontSize: 12, color: '#656d76', display: 'flex', gap: 8 }}>
            <span>{ws.owner?.name || 'Unknown'}</span>
            <span style={{ color: '#d0d7de' }}>·</span>
            <span>{count} {count === 1 ? 'member' : 'members'}</span>
            <span style={{ color: '#d0d7de' }}>·</span>
            <span>{chCount} {chCount === 1 ? 'channel' : 'channels'}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600,
              backgroundColor: isOwner ? '#ddf4ff' : '#f6f8fa',
              color: isOwner ? '#0969da' : '#656d76',
            }}>
              {isOwner ? 'Owner' : 'Member'}
            </span>
          </div>
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="#d0d7de"><path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"/></svg>
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
  const totalWorkspaces = workspaces.length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f8fa' }}>
      <Header user={user} onLogout={handleLogout} onDashboard={() => {}} />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0d1117', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Overview
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#656d76' }}>
            {totalWorkspaces} workspace{totalWorkspaces !== 1 ? 's' : ''} across your account
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
          <MemoStat icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h2.5C7.216 0 8 .784 8 1.75v2.5A1.75 1.75 0 0 1 6.25 6h-2.5A1.75 1.75 0 0 1 2 4.25Zm8 0C10 .784 10.784 0 11.75 0h2.5C15.216 0 16 .784 16 1.75v2.5A1.75 1.75 0 0 1 14.25 6h-2.5A1.75 1.75 0 0 1 10 4.25ZM2 9.75c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 6.25 14h-2.5A1.75 1.75 0 0 1 2 12.25Zm8 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 14.25 14h-2.5A1.75 1.75 0 0 1 10 12.25Z"/></svg>} label="Workspaces" value={totalWorkspaces} />
          <MemoStat icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 2h13a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5Zm0 1v1.5h13V3h-13Zm0 3V10h13V6h-13Zm0 5v1h13v-1h-13Z"/></svg>} label="Channels" value={totalChannels} />
          <MemoStat icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM5.5 9c-2.7 0-5 1.3-5 3v1h10v-1c0-1.7-2.3-3-5-3Zm6-5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM16 12c0-1.7-2.3-3-5-3-.6 0-1.2.1-1.8.3.5.6.8 1.4.8 2.3v1h6v-.6Z"/></svg>} label="Team Members" value={totalMembers} />
          <MemoStat icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7Z"/></svg>} label="Plan" value={user.plan === 'pro' ? 'Pro' : 'Free'} sub={user.plan !== 'pro' ? 'Upgrade →' : undefined} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0d1117', margin: 0 }}>Workspaces</h2>
          <button onClick={() => navigate(ROUTES.WORKSPACES)} style={linkS}>
            View all
          </button>
        </div>

        {wsLoading && workspaces.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#656d76', fontSize: 14 }}>Loading...</div>
        ) : workspaces.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', backgroundColor: '#fff', border: '1px solid #e1e4e8', borderRadius: 8 }}>
            <p style={{ color: '#656d76', fontSize: 14, margin: '0 0 16px' }}>No workspaces yet</p>
            <button onClick={() => navigate(ROUTES.WORKSPACES)} style={{
              ...linkS, backgroundColor: '#0969da', color: '#fff', border: 'none', fontWeight: 600,
            }}>
              Create workspace
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workspaces.slice(0, 5).map((ws) => (
              <MemoWorkspaceRow key={ws._id} ws={ws} onSelect={handleSelect} userId={user._id} />
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
      backgroundColor: '#fff', borderBottom: '1px solid #d0d7de',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, backgroundColor: '#0d1117',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="#fff">
              <path d="M2 1.75C2 .784 2.784 0 3.75 0h2.5C7.216 0 8 .784 8 1.75v2.5A1.75 1.75 0 0 1 6.25 6h-2.5A1.75 1.75 0 0 1 2 4.25Zm8 0C10 .784 10.784 0 11.75 0h2.5C15.216 0 16 .784 16 1.75v2.5A1.75 1.75 0 0 1 14.25 6h-2.5A1.75 1.75 0 0 1 10 4.25ZM2 9.75c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 6.25 14h-2.5A1.75 1.75 0 0 1 2 12.25Zm8 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 14.25 14h-2.5A1.75 1.75 0 0 1 10 12.25Z"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#0d1117' }}>TeamCollab</span>
        </div>

        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%', backgroundColor: '#0969da',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 600,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: '#24292f' }}>{user.name}</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="#656d76" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
              <path d="M4.427 5.427a.25.25 0 0 1 .354 0L8 8.646l3.219-3.219a.25.25 0 0 1 .354.354l-3.396 3.396a.25.25 0 0 1-.354 0L4.427 5.781a.25.25 0 0 1 0-.354Z"/>
            </svg>
          </div>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              backgroundColor: '#fff', border: '1px solid #d0d7de', borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 200, zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #f6f8fa' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0d1117' }}>{user.email}</div>
                <div style={{ fontSize: 11, color: '#656d76', marginTop: 2, textTransform: 'capitalize' }}>{user.plan || 'Free'} plan</div>
              </div>
              <div
                onClick={onLogout}
                style={{ padding: '10px 14px', fontSize: 13, color: '#cf222e', cursor: 'pointer', fontWeight: 500 }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f6f8fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8fa' }}>
      <div style={{ color: '#656d76', fontSize: 14 }}>{msg}</div>
    </div>
  )
}
