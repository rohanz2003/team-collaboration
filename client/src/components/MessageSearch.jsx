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
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f7fafc',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search messages..."
          autoFocus
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #cbd5e0',
            borderRadius: 6,
            fontSize: 13,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={onClose}
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: 18,
            color: '#a0aec0',
            padding: '0 4px',
          }}
          title="Close search"
        >
          ✕
        </button>
      </div>
      {loading && (
        <div style={{ fontSize: 12, color: '#a0aec0' }}>Searching...</div>
      )}
      {!loading && searched && results.length === 0 && (
        <div style={{ fontSize: 12, color: '#a0aec0' }}>
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
                border: 'none',
                backgroundColor: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 12,
                width: '100%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <span style={{ fontWeight: 600, color: '#2d3748', fontSize: 11 }}>
                {msg.sender?.name || 'Unknown'}
              </span>
              <span
                style={{
                  color: '#4a5568',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                {msg.text || (msg.messageType === 'file' ? msg.fileName : '')}
              </span>
              <span style={{ fontSize: 10, color: '#a0aec0' }}>
                {new Date(msg.createdAt).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
