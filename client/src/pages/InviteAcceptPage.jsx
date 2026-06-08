import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { inviteApi } from '../api/invite'
import { useAuth } from '../store/authStore'
import { ROUTES } from '../constants/routes'

export default function InviteAcceptPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { user, token: authToken } = useAuth()
  const [status, setStatus] = useState('loading')
  const [inviteInfo, setInviteInfo] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No invite token provided')
      return
    }

    const fetchInvite = async () => {
      try {
        const { data } = await inviteApi.getInviteByToken(token)
        setInviteInfo(data)
        setStatus('ready')
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Invalid or expired invite')
      }
    }

    fetchInvite()
  }, [token])

  const handleAccept = useCallback(async () => {
    setStatus('accepting')
    try {
      const { data } = await inviteApi.acceptInvite(token)
      setStatus('accepted')
      setMessage(`You've joined "${data.workspace?.name || 'the workspace'}"!`)
      setTimeout(() => {
        navigate(ROUTES.WORKSPACES)
      }, 2000)
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Failed to accept invite')
    }
  }, [token, navigate])

  const handleLoginFirst = useCallback(() => {
    navigate(`${ROUTES.LOGIN}?redirect=/invite?token=${token}`)
  }, [navigate, token])

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#718096' }}>
        Checking invitation...
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f7fafc',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 48,
          maxWidth: 440,
          width: '100%',
          margin: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}
      >
        {status === 'ready' && inviteInfo && (
          <>
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
                fontSize: 28,
                fontWeight: 700,
                margin: '0 auto 24px',
              }}
            >
              {inviteInfo.workspace?.name?.charAt(0).toUpperCase() || '?'}
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a202c', margin: '0 0 8px' }}>
              You're Invited!
            </h1>
            <p style={{ fontSize: 15, color: '#4a5568', margin: '0 0 4px' }}>
              <strong>{inviteInfo.invitedBy?.name || 'Someone'}</strong> invited you to join
            </p>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#2b6cb0', margin: '0 0 24px' }}>
              {inviteInfo.workspace?.name || 'a workspace'}
            </p>

            {user ? (
              <button
                onClick={handleAccept}
                style={{
                  padding: '14px 40px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: '#3182ce',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Accept Invitation
              </button>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: '#a0aec0', marginBottom: 16 }}>
                  You need to log in or create an account to accept this invitation.
                </p>
                <button
                  onClick={handleLoginFirst}
                  style={{
                    padding: '14px 40px',
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: '#3182ce',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Log In to Accept
                </button>
              </div>
            )}
          </>
        )}

        {status === 'accepting' && (
          <div style={{ color: '#718096', fontSize: 16 }}>
            Accepting invitation...
          </div>
        )}

        {(status === 'accepted' || status === 'error') && (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: status === 'accepted' ? '#48bb78' : '#e53e3e',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                margin: '0 auto 24px',
              }}
            >
              {status === 'accepted' ? '✓' : '!'}
            </div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: status === 'accepted' ? '#276749' : '#c53030',
                margin: '0 0 8px',
              }}
            >
              {status === 'accepted' ? 'Welcome!' : 'Invitation Error'}
            </h2>
            <p style={{ fontSize: 15, color: '#4a5568', margin: 0 }}>{message}</p>
            {status === 'accepted' && (
              <p style={{ fontSize: 13, color: '#a0aec0', marginTop: 12 }}>
                Redirecting to workspaces...
              </p>
            )}
            {status === 'error' && (
              <button
                onClick={() => navigate(ROUTES.WORKSPACES)}
                style={{
                  marginTop: 20,
                  padding: '12px 32px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#3182ce',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Go to Workspaces
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
