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
        padding: '6px 14px',
        borderRadius: 6,
        border: '1px solid #e2e8f0',
        backgroundColor: loading ? '#f7fafc' : '#fff',
        color: loading ? '#a0aec0' : '#4a5568',
        fontSize: 13,
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
      title="Summarize this channel"
    >
      {loading ? '...' : '✦'} Summarize
    </button>
  )
}
