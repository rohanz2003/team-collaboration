import { memo } from 'react'

function Button({ children, loading, disabled, variant = 'primary', ...props }) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        padding: '10px 28px',
        border: 'none',
        borderRadius: 6,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.7 : 1,
        fontSize: 15,
        fontWeight: 600,
        backgroundColor: variant === 'danger' ? '#e53e3e' : '#3182ce',
        color: '#fff',
      }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default memo(Button)
