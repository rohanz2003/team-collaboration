import { useState, useEffect, useCallback } from 'react'
import { messageApi } from '../api/message'

export default function MessageSearch({
  channelId,
  onSelectMessage,
  onClose,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = useCallback(async () => {
    if (!query.trim() || !channelId) return
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await messageApi.searchMessages(channelId, query.trim())
      setResults(data.messages || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, channelId])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) search()
    }, 400)
    return () => clearTimeout(timer)
  }, [query, search])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.()
    }
  }

  return (
    <div
      style={{
        padding: '10px 16px',
        borderBottom: '1px solid #d0d7de',
        backgroundColor: '#f6f8fa',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="#656d76" style={{ flexShrink: 0 }}>
          <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search messages..."
          autoFocus
          style={{
            flex: 1,
            padding: '6px 10px',
            border: '1px solid #d0d7de',
            borderRadius: 6,
            fontSize: 13,
            outline: 'none',
            fontFamily: 'inherit',
            backgroundColor: '#fff',
            color: '#0d1117',
          }}
        />
        <button
          onClick={onClose}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #d0d7de', backgroundColor: '#fff',
            cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
            color: '#656d76', lineHeight: 1,
          }}
          title="Close search"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z"/>
          </svg>
        </button>
      </div>
      {loading && (
        <div style={{ fontSize: 12, color: '#8b949e', padding: '4px 0' }}>Searching...</div>
      )}
      {!loading && searched && results.length === 0 && (
        <div style={{ fontSize: 12, color: '#8b949e', padding: '4px 0' }}>
          No messages found for "{query}"
        </div>
      )}
      {results.length > 0 && (
        <div
          style={{
            maxHeight: 200,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {results.map((msg) => (
            <button
              key={msg._id}
              onClick={() => {
                onSelectMessage?.(msg._id)
                onClose?.()
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #d0d7de',
                backgroundColor: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 12,
                width: '100%',
                transition: 'border-color 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0969da'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d0d7de'}
            >
              <span style={{ fontWeight: 600, color: '#0d1117', fontSize: 11 }}>
                {msg.sender?.name || 'Unknown'}
              </span>
              <span
                style={{
                  color: '#24292f',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                {msg.text || (msg.messageType === 'file' ? msg.fileName : '')}
              </span>
              <span style={{ fontSize: 10, color: '#8b949e' }}>
                {new Date(msg.createdAt).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
