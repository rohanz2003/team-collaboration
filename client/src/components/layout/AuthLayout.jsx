import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f0ff 100%)',
        padding: 24,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
        }}
      >
        <Link
          to={ROUTES.HOME}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 32,
            textDecoration: 'none',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            TC
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#1a1a2e',
              letterSpacing: '-0.5px',
            }}
          >
            TeamCollab
          </span>
        </Link>

        <div
          style={{
            padding: 40,
            backgroundColor: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #e9edf2',
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              margin: 0,
              color: '#1a1a2e',
              letterSpacing: '-0.5px',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: '#64748b', margin: '4px 0 24px', fontSize: 14 }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export default memo(AuthLayout)
