export default function MessageActions({
  isOwn,
  messageId,
  onEdit,
  onDelete,
  onReply,
  isDeleted,
}) {
  if (isDeleted) return null

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        opacity: 0,
        transition: 'opacity 0.15s',
        position: 'absolute',
        top: -16,
        [isOwn ? 'left' : 'right']: 0,
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: '2px 4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        zIndex: 5,
      }}
      className="message-actions"
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onReply?.(messageId)
        }}
        style={actionBtnStyle}
        title="Reply"
      >
        ↩
      </button>
      {isOwn && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(messageId)
            }}
            style={actionBtnStyle}
            title="Edit"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(messageId)
            }}
            style={{ ...actionBtnStyle, color: '#e53e3e' }}
            title="Delete"
          >
            ✕
          </button>
        </>
      )}
    </div>
  )
}

const actionBtnStyle = {
  border: 'none',
  backgroundColor: 'transparent',
  fontSize: 13,
  cursor: 'pointer',
  padding: '2px 4px',
  color: '#4a5568',
  borderRadius: 3,
  lineHeight: 1,
}
