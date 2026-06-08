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

  if (currentPlan === 'pro') {
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
            borderRadius: 16,
            padding: 40,
            maxWidth: 440,
            width: '100%',
            margin: 20,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#48bb78',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              margin: '0 auto 16px',
            }}
          >
            ✓
          </div>
          <h2 style={{ margin: '0 0 8px', color: '#276749', fontSize: 22 }}>
            You're on Pro!
          </h2>
          <p style={{ margin: '0 0 24px', color: '#718096', fontSize: 14 }}>
            You have access to all features including AI assistant, semantic search, and unlimited everything.
          </p>
          <button
            onClick={onClose}
            style={{
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
            Close
          </button>
        </div>
      </div>
    )
  }

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
          borderRadius: 16,
          padding: 40,
          maxWidth: 480,
          width: '100%',
          margin: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#fefcbf',
              color: '#d69e2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              margin: '0 auto 16px',
            }}
          >
            ★
          </div>
          <h2 style={{ margin: '0 0 4px', color: '#1a202c', fontSize: 24 }}>
            Upgrade to Pro
          </h2>
          <p style={{ margin: 0, color: '#718096', fontSize: 14 }}>
            Unlock the full power of TeamCollab
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          <div
            style={{
              flex: 1,
              padding: 20,
              borderRadius: 10,
              border: '2px solid #e2e8f0',
              backgroundColor: '#f7fafc',
            }}
          >
            <h3 style={{ margin: '0 0 12px', color: '#2d3748', fontSize: 16 }}>Free</h3>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1a202c', marginBottom: 12 }}>
              $0
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: '#4a5568', lineHeight: 2 }}>
              <li>✓ Basic messaging</li>
              <li>✓ 50 AI queries/month</li>
              <li>✓ File sharing (5MB)</li>
              <li>✓ Up to 10 channels</li>
              <li>✗ Semantic search</li>
              <li>✗ Unlimited AI</li>
            </ul>
          </div>
          <div
            style={{
              flex: 1,
              padding: 20,
              borderRadius: 10,
              border: '2px solid #3182ce',
              backgroundColor: '#ebf8ff',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#3182ce',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 12px',
                borderRadius: 10,
              }}
            >
              POPULAR
            </div>
            <h3 style={{ margin: '0 0 12px', color: '#2b6cb0', fontSize: 16 }}>Pro</h3>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1a202c', marginBottom: 12 }}>
              $9.99
              <span style={{ fontSize: 14, fontWeight: 400, color: '#718096' }}>/mo</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: '#4a5568', lineHeight: 2 }}>
              <li>✓ Everything in Free</li>
              <li>✓ Unlimited AI queries</li>
              <li>✓ Semantic search</li>
              <li>✓ File sharing (50MB)</li>
              <li>✓ Unlimited channels</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
        </div>

        {message && (
          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: message.includes('Upgraded') ? '#48bb78' : '#e53e3e',
              marginBottom: 12,
            }}
          >
            {message}
          </p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: loading ? '#cbd5e0' : '#3182ce',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 8,
          }}
        >
          {loading ? 'Processing...' : 'Subscribe to Pro — $9.99/mo'}
        </button>

        <button
          onClick={handleDemoUpgrade}
          disabled={demoLoading}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            color: '#4a5568',
            fontSize: 13,
            cursor: demoLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {demoLoading ? 'Upgrading...' : 'Try Pro for Free (Demo Mode)'}
        </button>

        <button
          onClick={onClose}
          style={{
            display: 'block',
            margin: '12px auto 0',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#a0aec0',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
