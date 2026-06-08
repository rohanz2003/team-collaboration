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
            maxWidth: 320,
            maxHeight: 240,
            borderRadius: 8,
            cursor: 'pointer',
            display: 'block',
            objectFit: 'cover',
          }}
        />
        {msg.text && (
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#1a202c' }}>
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
              style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }}
            />
          </div>
        )}
      </div>
    )
  }

  const icon = msg.fileType === 'pdf' ? '' : ''
  const ext = msg.fileName?.split('.').pop()?.toUpperCase() || 'FILE'

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
            padding: '10px 14px', borderRadius: 8,
            backgroundColor: '#f7fafc', border: '1px solid #e2e8f0',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#edf2f7' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f7fafc' }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: 6,
              backgroundColor: '#3182ce', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, flexShrink: 0,
            }}
          >
            {ext}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14, fontWeight: 500, color: '#2d3748',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {msg.fileName || 'file'}
            </div>
            <div style={{ fontSize: 12, color: '#3182ce', fontWeight: 500 }}>
              Download
            </div>
          </div>
        </div>
      </a>
      {msg.text && (
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#1a202c' }}>
          {msg.text}
        </p>
      )}
    </div>
  )
}

export default memo(MessageFile)
