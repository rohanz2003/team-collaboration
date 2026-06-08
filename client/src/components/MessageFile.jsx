import { useState } from 'react'

const FILE_ICON = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="#8696a0">
    <path d="M2.75 0C1.784 0 1 .784 1 1.75v12.5c0 .966.784 1.75 1.75 1.75h10.5c.966 0 1.75-.784 1.75-1.75V5.914a1.75 1.75 0 0 0-.513-1.237L10.323 1.513A1.75 1.75 0 0 0 9.086 1H2.75ZM2.5 1.75a.25.25 0 0 1 .25-.25h5.25v3.75c0 .966.784 1.75 1.75 1.75h3.75v7.25a.25.25 0 0 1-.25.25H2.75a.25.25 0 0 1-.25-.25ZM12.19 6h-2.44a.25.25 0 0 1-.25-.25V3.31l2.69 2.69Z"/>
  </svg>
)

const PDF_ICON = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="#f85149">
    <path d="M2.75 0C1.784 0 1 .784 1 1.75v12.5c0 .966.784 1.75 1.75 1.75h10.5c.966 0 1.75-.784 1.75-1.75V5.914a1.75 1.75 0 0 0-.513-1.237L10.323 1.513A1.75 1.75 0 0 0 9.086 1H2.75ZM2.5 1.75a.25.25 0 0 1 .25-.25h5.25v3.75c0 .966.784 1.75 1.75 1.75h3.75v7.25a.25.25 0 0 1-.25.25H2.75a.25.25 0 0 1-.25-.25Z"/>
  </svg>
)

const IMG_ICON = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="#25D366">
    <path d="M1 3.25C1 1.784 2.784 0 4.25 0h7.5C13.216 0 15 1.784 15 3.25v9.5c0 1.466-1.784 2.75-3.25 2.75h-7.5C2.784 15.5 1 13.716 1 12.25Zm1.5-.25v2.293l2.61 2.61a1.75 1.75 0 0 0 2.475 0L10.75 5.5l-1.06-1.06a.75.75 0 0 1 1.06-1.06L11.87 4.5H14A.25.25 0 0 0 14 4h-7.5A1.25 1.25 0 0 1 5.25 2.75v-.5A.25.25 0 0 0 5 2H4.25A.75.75 0 0 0 3.5 2.75v.5c0 .138.112.25.25.25h1.5a.75.75 0 0 1 0 1.5h-1.5A1.75 1.75 0 0 1 1.75 3h-.25Zm.47 5.53 2.58 2.58a.25.25 0 0 0 .354 0l.896-.896a.75.75 0 0 1 1.06 0l.896.896a.25.25 0 0 0 .354 0l2.79-2.79A.25.25 0 0 1 10.5 8.75v3.5a.25.25 0 0 1-.25.25h-7.5a.25.25 0 0 1-.25-.25v-3.5a.25.25 0 0 1 .47-.22Z"/>
  </svg>
)

function getIcon(name) {
  const ext = name?.split('.').pop()?.toLowerCase()
  if (['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext)) return IMG_ICON
  if (ext === 'pdf') return PDF_ICON
  return FILE_ICON
}

export default function MessageFile({ fileName, fileUrl, fileType, className }) {
  const [error, setError] = useState(false)

  const isImage = fileType?.startsWith('image/')
  const ext = fileName?.split('.').pop()?.toLowerCase()
  if (!isImage && ['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext)) {
    // also handle images sent without proper fileType
  }

  return (
    <div className={className} style={{
      display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 300,
    }}>
      {isImage && !error ? (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" title="Open image" style={{ lineHeight: 0 }}>
          <img
            src={fileUrl}
            alt={fileName || 'Image'}
            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, display: 'block', cursor: 'pointer' }}
            onError={() => setError(true)}
            loading="lazy"
          />
        </a>
      ) : error ? (
        <div style={{
          padding: '8px 12px', borderRadius: 6, backgroundColor: '#f0f2f5',
          fontSize: 12, color: '#667781',
        }}>
          Image failed to load
        </div>
      ) : null}
      {(!isImage || error) && (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
          download={fileName}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 8px', borderRadius: 6,
            backgroundColor: '#f0f2f5', color: '#111b21',
            textDecoration: 'none', fontSize: 12, maxWidth: '100%',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9edef'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}>
          {getIcon(fileName)}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {fileName || 'File'}
          </span>
        </a>
      )}
    </div>
  )
}
