import { useState, memo } from 'react'

function MessageFile({ msg }) {
  const [showFull, setShowFull] = useState(false)
  const isImage = msg.fileType === 'image'

  if (isImage) {
    return (
      <div>
        <img
          src={msg.fileUrl}
          alt={msg.fileName || 'image'}
          onClick={() => setShowFull(true)}
          style={{
            maxWidth: 320, maxHeight: 240, borderRadius: 6,
            cursor: 'pointer', display: 'block', objectFit: 'cover',
            border: '1px solid #d0d7de',
          }}
        />
        {msg.text && (
          <p style={{ margin: '5px 0 0', fontSize: 13, color: '#0d1117' }}>
            {msg.text}
          </p>
        )}
        {showFull && (
          <div
            onClick={() => setShowFull(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              backgroundColor: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <img
              src={msg.fileUrl}
              alt={msg.fileName || 'image'}
              style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 6 }}
            />
          </div>
        )}
      </div>
    )
  }

  const ext = msg.fileName?.split('.').pop()?.toUpperCase() || 'FILE'
  const colors = ['#0969da', '#8250df', '#cf222e', '#1a7f37']
  const bgColor = colors[ext.charCodeAt(0) % colors.length]

  return (
    <div>
      <a
        href={msg.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={msg.fileName}
        style={{ textDecoration: 'none' }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 6,
            backgroundColor: '#f6f8fa', border: '1px solid #d0d7de',
            transition: 'background-color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0969da' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d0d7de' }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: 6,
              backgroundColor: bgColor, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, flexShrink: 0,
            }}
          >
            {ext}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13, fontWeight: 500, color: '#0d1117',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {msg.fileName || 'file'}
            </div>
            <div style={{ fontSize: 12, color: '#0969da', fontWeight: 500 }}>
              Download
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#656d76">
            <path d="M7.5 1.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5Zm7.5 0v4.5a2.25 2.25 0 0 1-2.25 2.25h-4.5A2.25 2.25 0 0 1 6 6.25v-4.5A2.25 2.25 0 0 1 8.25 0h4.5A2.25 2.25 0 0 1 15 2.25ZM1.75 4.5a.75.75 0 0 1 .75-.75H6v1.5H2.5v8.75h8.75V10H12v4.25a1.75 1.75 0 0 1-1.75 1.75h-8.5A1.75 1.75 0 0 1 0 14.25v-8.5A1.75 1.75 0 0 1 1.75 4.5Z"/>
          </svg>
        </div>
      </a>
      {msg.text && (
        <p style={{ margin: '5px 0 0', fontSize: 13, color: '#0d1117' }}>
          {msg.text}
        </p>
      )}
    </div>
  )
}

export default memo(MessageFile)
