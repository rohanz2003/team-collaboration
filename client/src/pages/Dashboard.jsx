import { useEffect, useCallback, useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useLogout } from '../store/authStore'
import { useFetchWorkspaces, useWorkspaces, useWorkspaceLoading } from '../store/workspaceStore'
import Button from '../components/ui/Button'
import { ROUTES } from '../constants/routes'

function StatCard({ icon, label, value, gradient }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 14,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      border: '1px solid #e9edf2',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        color: '#fff',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

const MemoStat = memo(StatCard)

function QuickAction({ icon, label, onClick, gradient }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        backgroundColor: '#fff',
        border: '1px solid #e9edf2',
        borderRadius: 12,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        color: '#1a1a2e',
        width: '100%',
        textAlign: 'left',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        color: '#fff',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <span>{label}</span>
      <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 18 }}>→</span>
    </button>
  )
}

const MemoQuickAction = memo(QuickAction)

function WorkspaceCard({ ws, onSelect, idx }) {
  const memberCount = ws.members?.length || 0
  const channelCount = ws.channels?.length || 0
  const ownerName = ws.owner?.name || 'Unknown'
  const initials = ws.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()

  const colors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #f97316)',
    'linear-gradient(135deg, #ef4444, #f43f5e)',
    'linear-gradient(135deg, #8b5cf6, #d946ef)',
  ]

  return (
    <div
      onClick={() => onSelect(ws)}
      style={{
        backgroundColor: '#fff',
        borderRadius: 14,
        border: '1px solid #e9edf2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      <div style={{
        height: 80,
        background: colors[idx % colors.length],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: 1,
      }}>
        {initials}
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{ws.name}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
          {ownerName} · {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8' }}>
          <span>💬 {channelCount} channels</span>
          <span>👥 {memberCount} members</span>
        </div>
      </div>
    </div>
  )
}

const MemoWorkspaceCard = memo(WorkspaceCard)

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()
  const fetchWorkspaces = useFetchWorkspaces()
  const workspaces = useWorkspaces()
  const wsLoading = useWorkspaceLoading()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    fetchWorkspaces()
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [fetchWorkspaces])

  const handleLogout = useCallback(() => {
    logout()
    navigate(ROUTES.LOGIN)
  }, [logout, navigate])

  const handleSelect = useCallback(async (ws) => {
    const { useSetWorkspace } = await import('../store/workspaceStore')
    useSetWorkspace.getState().setWorkspace(ws)
    navigate(ROUTES.WORKSPACE_VIEW)
  }, [navigate])

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ color: '#64748b', fontSize: 15 }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ color: '#64748b', fontSize: 15 }}>Please log in</div>
      </div>
    )
  }

  const totalChannels = workspaces.reduce((sum, w) => sum + (w.channels?.length || 0), 0)
  const totalMembers = [...new Set(workspaces.flatMap(w => w.members?.map(m => m.user?._id || m.user) || []))].length

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
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
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{user.email}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            {greeting}, {user.name.split(' ')[0]}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>Here's what's happening across your workspaces.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
          <MemoStat icon="🏢" label="Workspaces" value={workspaces.length} gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" />
          <MemoStat icon="💬" label="Channels" value={totalChannels} gradient="linear-gradient(135deg, #3b82f6, #06b6d4)" />
          <MemoStat icon="👥" label="Team Members" value={totalMembers} gradient="linear-gradient(135deg, #10b981, #34d399)" />
          <MemoStat icon="📊" label="Plan" value={user.plan === 'pro' ? 'Pro' : 'Free'} gradient="linear-gradient(135deg, #f59e0b, #f97316)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Your Workspaces</h2>
              <button
                onClick={() => navigate(ROUTES.WORKSPACES)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#fff',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View all
              </button>
            </div>
            {wsLoading && workspaces.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Loading workspaces...</div>
            ) : workspaces.length === 0 ? (
              <div style={{
                padding: 40,
                textAlign: 'center',
                backgroundColor: '#fff',
                borderRadius: 14,
                border: '1px solid #e9edf2',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏗️</div>
                <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 16px' }}>No workspaces yet. Create your first one to get started.</p>
                <Button onClick={() => navigate(ROUTES.WORKSPACES)} style={{ width: 'auto', padding: '10px 24px' }}>
                  Create Workspace
                </Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {workspaces.slice(0, 6).map((ws, i) => (
                  <MemoWorkspaceCard key={ws._id} ws={ws} onSelect={handleSelect} idx={i} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <MemoQuickAction
                icon="➕"
                label="New Workspace"
                onClick={() => navigate(ROUTES.WORKSPACES)}
                gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
              />
              <MemoQuickAction
                icon="🎯"
                label="Go to Dashboard"
                onClick={() => navigate(ROUTES.DASHBOARD)}
                gradient="linear-gradient(135deg, #3b82f6, #06b6d4)"
              />
              <MemoQuickAction
                icon="👤"
                label="Edit Profile"
                onClick={() => {}}
                gradient="linear-gradient(135deg, #10b981, #34d399)"
              />
              <MemoQuickAction
                icon="🚪"
                label="Sign Out"
                onClick={handleLogout}
                gradient="linear-gradient(135deg, #ef4444, #f43f5e)"
              />
            </div>

            <div style={{
              marginTop: 20,
              padding: 18,
              backgroundColor: '#fff',
              borderRadius: 14,
              border: '1px solid #e9edf2',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Plan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: user.plan === 'pro' ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'linear-gradient(135deg, #94a3b8, #cbd5e0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: '#fff',
                }}>
                  {user.plan === 'pro' ? '⭐' : '🔵'}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', textTransform: 'capitalize' }}>{user.plan || 'Free'}</div>
                  {user.plan !== 'pro' && (
                    <button
                      onClick={() => window.dispatchEvent(new Event('open-upgrade-modal'))}
                      style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#6366f1',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Upgrade to Pro →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
