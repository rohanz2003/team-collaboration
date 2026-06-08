import { useState } from 'react'
import { inviteApi } from '../api/invite'
import { workspaceApi } from '../api/workspace'

export default function InviteUserModal({
  workspaceId,
  onClose,
  onInviteSent,
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [invites, setInvites] = useState([])
  const [showSent, setShowSent] = useState(false)

  const loadInvites = async () => {
    try {
      const { data } = await inviteApi.getInvites(workspaceId)
      setInvites(data.invites || [])
    } catch {}
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      await inviteApi.sendInvite(workspaceId, email.trim())
      setMessage(`Invite sent to ${email.trim()}`)
      setEmail('')
      onInviteSent?.()
      loadInvites()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (inviteId) => {
    try {
      await inviteApi.cancelInvite(inviteId)
      loadInvites()
    } catch {}
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the workspace?')) return
    try {
      await workspaceApi.removeMember(workspaceId, userId)
      onInviteSent?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member')
    }
  }

  useState(() => {
    loadInvites()
  }, [loadInvites])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 28,
          width: 440,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a202c' }}>
            Manage Workspace
          </h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: 20,
              cursor: 'pointer',
              color: '#a0aec0',
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', margin: '0 0 12px' }}>
            Invite by Email
          </h3>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #cbd5e0',
                borderRadius: 6,
                fontSize: 14,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: loading || !email.trim() ? '#cbd5e0' : '#3182ce',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Sending...' : 'Invite'}
            </button>
          </form>
          {message && (
            <p style={{ color: '#48bb78', fontSize: 13, margin: '8px 0 0' }}>{message}</p>
          )}
          {error && (
            <p style={{ color: '#e53e3e', fontSize: 13, margin: '8px 0 0' }}>{error}</p>
          )}
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <button
              onClick={() => setShowSent(false)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: !showSent ? '#3182ce' : '#e2e8f0',
                color: !showSent ? '#fff' : '#4a5568',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Pending Invites
            </button>
            <button
              onClick={() => setShowSent(true)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: showSent ? '#3182ce' : '#e2e8f0',
                color: showSent ? '#fff' : '#4a5568',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sent Invites
            </button>
          </div>

          {!showSent && (
            <div>
              {invites.filter((i) => i.status === 'pending').length === 0 && (
                <p style={{ color: '#a0aec0', fontSize: 13, textAlign: 'center', padding: 16 }}>
                  No pending invites
                </p>
              )}
              {invites
                .filter((i) => i.status === 'pending')
                .map((inv) => (
                  <div
                    key={inv._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: '#f7fafc',
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 13, color: '#2d3748' }}>{inv.email}</span>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#ecc94b',
                          marginLeft: 8,
                          backgroundColor: '#fefcbf',
                          padding: '1px 6px',
                          borderRadius: 4,
                        }}
                      >
                        pending
                      </span>
                    </div>
                    <button
                      onClick={() => handleCancel(inv._id)}
                      style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#e53e3e',
                        cursor: 'pointer',
                        fontSize: 12,
                        padding: '4px 8px',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
            </div>
          )}

          {showSent && (
            <div>
              {invites.filter((i) => i.status !== 'pending').length === 0 && (
                <p style={{ color: '#a0aec0', fontSize: 13, textAlign: 'center', padding: 16 }}>
                  No sent invites
                </p>
              )}
              {invites
                .filter((i) => i.status !== 'pending')
                .map((inv) => (
                  <div
                    key={inv._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: '#f7fafc',
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#4a5568' }}>{inv.email}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#718096',
                        textTransform: 'capitalize',
                      }}
                    >
                      {inv.status}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
