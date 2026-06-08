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
        display: 'inline-flex', gap: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e9edef',
        borderRadius: 20,
        padding: '2px 4px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onReply?.(messageId) }}
        style={actionBtnStyle}
        title="Reply"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      {isOwn && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(messageId) }}
            style={actionBtnStyle}
            title="Edit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(messageId) }}
            style={{ ...actionBtnStyle, color: '#f85149' }}
            title="Delete"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

const actionBtnStyle = {
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  padding: '5px',
  color: '#667781',
  borderRadius: '50%',
  lineHeight: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.1s',
}
