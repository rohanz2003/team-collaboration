import { useState } from 'react'
import { paymentApi } from '../api/payment'
import { usePlan } from '../store/subscriptionStore'

export default function UpgradeProModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const currentPlan = usePlan()

  const handleUpgrade = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const { data } = await paymentApi.createCheckoutSession('pro')
      if (data.demo) {
        window.location.href = data.demoUrl
      } else if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upgrade failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoUpgrade = async () => {
    setDemoLoading(true)
    setMessage(null)
    try {
      await paymentApi.demoUpgrade()
      setMessage('Upgraded to Pro! Refreshing...')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Demo upgrade failed')
    } finally {
      setDemoLoading(false)
    }
  }

  const overlay = {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  }

  const modal = {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 32, maxWidth: 480, width: '100%', margin: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  }

  const planCard = (highlight) => ({
    flex: 1, padding: 16,
    borderRadius: 8,
    border: highlight ? '2px solid #25D366' : '1px solid #e9edef',
    backgroundColor: highlight ? '#e6f7ed' : '#f0f2f5',
    position: 'relative',
  })

  const ulStyle = {
    listStyle: 'none', padding: 0, margin: 0,
    fontSize: 12, color: '#111b21', lineHeight: 1.8,
  }

  const btnPri = {
    width: '100%', padding: '12px', borderRadius: 8,
    border: 'none', backgroundColor: '#25D366', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    marginBottom: 8, transition: 'background-color 0.15s',
  }

  if (currentPlan === 'pro') {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={{ ...modal, textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: '#dcf8c6', color: '#1a7f37',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
            </svg>
          </div>
          <h2 style={{ margin: '0 0 6px', color: '#111b21', fontSize: 20 }}>You're on Pro!</h2>
          <p style={{ margin: '0 0 20px', color: '#667781', fontSize: 13, lineHeight: 1.5 }}>
            You have access to all features including AI assistant, semantic search, and unlimited everything.
          </p>
          <button onClick={onClose} style={btnPri}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundColor: '#dcf8c6', color: '#075E54',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.445Z"/>
            </svg>
          </div>
          <h2 style={{ margin: '0 0 2px', color: '#111b21', fontSize: 20 }}>Upgrade to Pro</h2>
          <p style={{ margin: 0, color: '#667781', fontSize: 13 }}>Unlock the full power of TeamCollab</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={planCard(false)}>
            <h3 style={{ margin: '0 0 8px', color: '#111b21', fontSize: 14 }}>Free</h3>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111b21', marginBottom: 8 }}>
              $0<span style={{ fontSize: 12, fontWeight: 400, color: '#667781' }}>/mo</span>
            </div>
            <ul style={ulStyle}>
              <li><FeatureIcon ok /> Basic messaging</li>
              <li><FeatureIcon ok /> 50 AI queries/month</li>
              <li><FeatureIcon ok /> File sharing (5MB)</li>
              <li><FeatureIcon ok /> Up to 10 channels</li>
              <li><FeatureIcon fail /> Semantic search</li>
              <li><FeatureIcon fail /> Unlimited AI</li>
            </ul>
          </div>
          <div style={planCard(true)}>
            <div style={{
              position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
              backgroundColor: '#25D366', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 6,
            }}>
              POPULAR
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#075E54', fontSize: 14 }}>Pro</h3>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111b21', marginBottom: 8 }}>
              $9.99<span style={{ fontSize: 12, fontWeight: 400, color: '#667781' }}>/mo</span>
            </div>
            <ul style={ulStyle}>
              <li><FeatureIcon ok /> Everything in Free</li>
              <li><FeatureIcon ok /> Unlimited AI queries</li>
              <li><FeatureIcon ok /> Semantic search</li>
              <li><FeatureIcon ok /> File sharing (50MB)</li>
              <li><FeatureIcon ok /> Unlimited channels</li>
              <li><FeatureIcon ok /> Priority support</li>
            </ul>
          </div>
        </div>

        {message && (
          <p style={{
            textAlign: 'center', fontSize: 12,
            color: message.includes('Upgraded') ? '#25D366' : '#f85149',
            marginBottom: 12,
          }}>
            {message}
          </p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            ...btnPri,
            backgroundColor: loading ? '#e9edef' : '#25D366',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#20BD5A' }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#25D366' }}
        >
          {loading ? 'Processing...' : 'Subscribe to Pro — $9.99/mo'}
        </button>

        <button
          onClick={handleDemoUpgrade}
          disabled={demoLoading}
          style={{
            width: '100%', padding: '10px', borderRadius: 8,
            border: '1px solid #e9edef', backgroundColor: '#fff',
            color: '#111b21', fontSize: 13,
            cursor: demoLoading ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#25D366'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e9edef'}
        >
          {demoLoading ? 'Upgrading...' : 'Try Pro for Free (Demo Mode)'}
        </button>

        <button
          onClick={onClose}
          style={{
            display: 'block', margin: '10px auto 0',
            border: 'none', backgroundColor: 'transparent',
            color: '#8696a0', fontSize: 12, cursor: 'pointer',
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

function FeatureIcon({ ok }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill={ok ? '#25D366' : '#8696a0'} style={{ marginRight: 6, verticalAlign: 'middle' }}>
      {ok ? (
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
      ) : (
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z"/>
      )}
    </svg>
  )
}
