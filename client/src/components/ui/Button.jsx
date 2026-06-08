import { memo } from 'react'

function Button({ children, onClick, type = 'submit', loading, disabled, variant = 'primary', style, ...props }) {
  const baseStyle = {
    width: '100%',
    padding: '12px 24px',
    borderRadius: 10,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }

  const variants = {
    primary: {
      background: loading || disabled ? '#cbd5e0' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff',
      boxShadow: loading || disabled ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.3)',
    },
    danger: {
      backgroundColor: loading || disabled ? '#cbd5e0' : '#ef4444',
      color: '#fff',
    },
    outline: {
      backgroundColor: '#fff',
      color: '#475569',
      border: '1.5px solid #e2e8f0',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...baseStyle, ...variants[variant], ...style }}
      {...props}
    >
      {loading && <span style={{ fontSize: 14 }}>⟳</span>}
      {children}
    </button>
  )
}

export default memo(Button)
