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
        display: 'flex', gap: 2,
        position: 'absolute',
        top: 0,
        [isOwn ? 'left' : 'right']: 0,
        backgroundColor: '#ffffff',
        border: '1px solid #e9edef',
        borderRadius: 20,
        padding: '2px 6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        zIndex: 5,
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onReply?.(messageId) }}
        style={actionBtnStyle}
        title="Reply"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#8696a0">
          <path d="M1.75 2.5a.75.75 0 0 0-.75.75v6.5c0 .414.336.75.75.75h8a.75.75 0 0 0 .75-.75.75.75 0 0 1 1.5 0v.5A2.25 2.25 0 0 1 9.75 12h-8A2.25 2.25 0 0 1 1.5 9.75v-6.5A2.25 2.25 0 0 1 3.75 1h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 0-.75.75v3.5h8.5v-.5a.75.75 0 0 1 1.5 0v.5h1.25a.75.75 0 0 1 .705 1.064l-2 4.5a.75.75 0 0 1-1.34-.033l-.026-.054-.104-.25H5.75a.75.75 0 0 1 0-1.5h1.965l.277-.623H3.75a.75.75 0 0 1-.75-.75V3.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5H3.75v2.5h8.5v-.5a.75.75 0 0 1 1.5 0v1.25a.75.75 0 0 1-.75.75h-1.25l-.75 1.5H9.75a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5v-2.5H1.75Z"/>
        </svg>
      </button>
      {isOwn && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(messageId) }}
            style={actionBtnStyle}
            title="Edit"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#8696a0">
              <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L3.988 10.572a.25.25 0 0 0-.064.108l-.626 2.19 2.19-.626a.25.25 0 0 0 .108-.064l8.074-8.073a.25.25 0 0 0 0-.354l-1.086-1.086Z"/>
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(messageId) }}
            style={{ ...actionBtnStyle, color: '#f85149' }}
            title="Delete"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5h-.5l-.721 9.673A1.75 1.75 0 0 1 10.282 16H5.718a1.75 1.75 0 0 1-1.747-1.827L3.25 4.5h-.5a.75.75 0 0 1 0-1.5H5V1.75A1.75 1.75 0 0 1 6.75 0h2.5A1.75 1.75 0 0 1 11 1.75ZM5.75 6.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z"/>
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
  padding: '6px',
  color: '#667781',
  borderRadius: '50%',
  lineHeight: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.1s',
}