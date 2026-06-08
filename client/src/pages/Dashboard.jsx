import { useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useLogout } from '../store/authStore'
import Button from '../components/ui/Button'
import { ROUTES } from '../constants/routes'

function UserCard({ user }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 32,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: '#3182ce',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
      <h2 style={{ margin: '0 0 4px', color: '#1a202c' }}>{user.name}</h2>
      <p style={{ margin: '0 0 2px', color: '#718096' }}>{user.email}</p>
      <p style={{ margin: 0, color: '#a0aec0', fontSize: 12 }}>
        ID: {user._id}
      </p>
    </div>
  )
}

const MemoizedUserCard = memo(UserCard)

export default function Dashboard() {
  const { user, loading } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = useCallback(() => {
    logout()
    navigate(ROUTES.LOGIN)
  }, [logout, navigate])

  const goToWorkspaces = useCallback(() => {
    navigate(ROUTES.WORKSPACES)
  }, [navigate])

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 80 }}>Loading...</div>
  }

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: 80 }}>No user data</div>
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '80px auto',
        padding: '0 20px',
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#1a202c',
          marginBottom: 24,
        }}
      >
        Dashboard
      </h1>

      <MemoizedUserCard user={user} />

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Button onClick={goToWorkspaces}>
          Go to Workspaces
        </Button>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  )
}
