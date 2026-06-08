import { useState, useCallback } from 'react'
import { aiApi } from '../api/ai'

export default function SummaryButton({ channelId, onSummaryComplete }) {
  const [loading, setLoading] = useState(false)

  const handleSummarize = useCallback(async () => {
    if (!channelId || loading) return
    setLoading(true)
    try {
      const { data } = await aiApi.summarizeChannel(channelId)
      onSummaryComplete?.(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [channelId, loading, onSummaryComplete])

  return (
    <button
      onClick={handleSummarize}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '6px 12px', borderRadius: 6,
        border: '1px solid #d0d7de', backgroundColor: loading ? '#f6f8fa' : '#fff',
        color: loading ? '#8b949e' : '#24292f',
        fontSize: 12, fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.borderColor = '#0969da' }}
      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.borderColor = '#d0d7de' }}
      title="Summarize this channel"
    >
      {loading ? (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M8 0a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 0Zm0 10a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 10Z"/>
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 1.75A.75.75 0 0 1 .75 1h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 0 1.75ZM0 5.25a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 5.25Zm0 3.5a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 8.75Zm0 3.5a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75Z"/>
        </svg>
      )}
      Summarize
    </button>
  )
}
