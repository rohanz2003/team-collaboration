import { memo } from 'react'

function Alert({ message, onClose, type = 'error' }) {
  if (!message) return null

  const colors = {
    error: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' },
    info: { bg: '#eef2ff', border: '#c7d2fe', color: '#6366f1' },
  }

  const c = colors[type] || colors.error

  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 10,
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: 16,
            color: c.color,
            padding: 0,
            lineHeight: 1,
            marginLeft: 8,
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default memo(Alert)
