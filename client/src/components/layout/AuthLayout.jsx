import { memo } from 'react'

function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 40,
          backgroundColor: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            margin: 0,
            color: '#1a202c',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: '#718096', margin: '4px 0 24px', fontSize: 14 }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}

export default memo(AuthLayout)
