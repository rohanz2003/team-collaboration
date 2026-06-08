import { memo } from 'react'

function Alert({ type = 'error', message, onClose }) {
  if (!message) return null

  const colors = {
    error: { bg: '#fff5f5', border: '#fed7d7', text: '#c53030' },
    success: { bg: '#f0fff4', border: '#c6f6d5', text: '#276749' },
    info: { bg: '#ebf8ff', border: '#bee3f8', text: '#2b6cb0' },
  }

  const c = colors[type] || colors.error

  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 6,
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        marginBottom: 16,
        fontSize: 14,
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
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: c.text,
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      )}
    </div>
  )
}

export default memo(Alert)
