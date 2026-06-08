import { useState, useRef, useEffect, useCallback } from 'react'
import { aiApi } from '../api/ai'
import { useIsPro } from '../store/subscriptionStore'

export default function AIPanel({ channelId, messages, onClose }) {
  const [query, setQuery] = useState('')
  const [conversation, setConversation] = useState([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [tab, setTab] = useState('chat')
  const bottomRef = useRef(null)
  const isPro = useIsPro()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  const handleAsk = useCallback(async () => {
    if (!query.trim() || loading) return
    const q = query.trim()
    setQuery('')
    setLoading(true)
    setConversation((prev) => [...prev, { role: 'user', content: q }])
    try {
      const { data } = await aiApi.askAI(q, channelId)
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ])
    } catch (err) {
      const msg = err.response?.data?.message || 'AI query failed'
      if (err.response?.data?.code === 'AI_QUOTA_EXCEEDED') {
        setConversation((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: msg + ' — Upgrade to Pro for unlimited AI access.',
            upgradePrompt: true,
          },
        ])
      } else {
        setConversation((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
        ])
      }
    } finally {
      setLoading(false)
    }
  }, [query, loading, channelId])

  const handleSummarize = useCallback(async () => {
    if (!channelId || summaryLoading) return
    setSummaryLoading(true)
    setSummary(null)
    try {
      const { data } = await aiApi.summarizeChannel(channelId)
      setSummary(data)
    } catch (err) {
      setSummary({ summary: 'Failed to generate summary.', keyPoints: [], tasks: [], decisions: [] })
    } finally {
      setSummaryLoading(false)
    }
  }, [channelId, summaryLoading])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
    if (e.key === 'Escape') onClose?.()
  }

  return (
    <div
      style={{
        width: 360,
        borderLeft: '1px solid #e2e8f0',
        backgroundColor: '#f7fafc',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
          AI Assistant
        </span>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: 18,
            color: '#a0aec0',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setTab('chat')}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            backgroundColor: tab === 'chat' ? '#ebf8ff' : 'transparent',
            color: tab === 'chat' ? '#2b6cb0' : '#718096',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: tab === 'chat' ? '2px solid #3182ce' : '2px solid transparent',
          }}
        >
          Chat
        </button>
        <button
          onClick={() => {
            setTab('summarize')
            if (!summary) handleSummarize()
          }}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            backgroundColor: tab === 'summarize' ? '#ebf8ff' : 'transparent',
            color: tab === 'summarize' ? '#2b6cb0' : '#718096',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: tab === 'summarize' ? '2px solid #3182ce' : '2px solid transparent',
          }}
        >
          Summarize
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {tab === 'chat' && (
          <>
            {conversation.length === 0 && (
              <div style={{ fontSize: 13, color: '#a0aec0', textAlign: 'center', padding: 24 }}>
                Ask me anything about this channel!<br />
                <span style={{ fontSize: 11 }}>
                  Try: "What was discussed today?" or "List action items"
                </span>
              </div>
            )}
            {conversation.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: msg.role === 'user' ? '#ebf8ff' : '#fff',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#2d3748',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', marginBottom: 4 }}>
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                {msg.upgradePrompt && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() => {
                        const event = new CustomEvent('open-upgrade-modal')
                        window.dispatchEvent(event)
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        border: 'none',
                        backgroundColor: '#3182ce',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#a0aec0',
                }}
              >
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}

        {tab === 'summarize' && (
          <>
            {summaryLoading && (
              <div style={{ textAlign: 'center', padding: 24, color: '#a0aec0', fontSize: 13 }}>
                Generating summary...
              </div>
            )}
            {summary && (
              <div>
                <div
                  style={{
                    padding: 12,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', marginBottom: 4 }}>
                    Summary
                  </div>
                  <div style={{ fontSize: 13, color: '#2d3748', lineHeight: 1.6 }}>
                    {summary.summary}
                  </div>
                </div>

                {summary.keyPoints?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', marginBottom: 6 }}>
                      Key Points
                    </div>
                    {summary.keyPoints.map((kp, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#fff',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                          marginBottom: 4,
                          fontSize: 12,
                          color: '#4a5568',
                        }}
                      >
                        • {kp}
                      </div>
                    ))}
                  </div>
                )}

                {summary.tasks?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', marginBottom: 6 }}>
                      Action Items
                    </div>
                    {summary.tasks.map((task, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#fff',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                          marginBottom: 4,
                          fontSize: 12,
                          color: '#4a5568',
                        }}
                      >
                        ☐ {task.task || task}
                      </div>
                    ))}
                  </div>
                )}

                {summary.decisions?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', marginBottom: 6 }}>
                      Decisions
                    </div>
                    {summary.decisions.map((dec, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#fff',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                          marginBottom: 4,
                          fontSize: 12,
                          color: '#4a5568',
                        }}
                      >
                        → {dec}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSummarize}
                  style={{
                    marginTop: 12,
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#fff',
                    color: '#4a5568',
                    fontSize: 12,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Refresh Summary
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {tab === 'chat' && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI..."
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
              onClick={handleAsk}
              disabled={loading || !query.trim()}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: loading || !query.trim() ? '#cbd5e0' : '#3182ce',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Ask
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
