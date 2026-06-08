import { useState, useRef, useEffect, useCallback } from 'react'
import { aiApi } from '../api/ai'
import { useIsPro } from '../store/subscriptionStore'

export default function AIPanel({ channelId, messages, onClose, workspaceId }) {
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
      const { data } = await aiApi.askAI(q, channelId, workspaceId)
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ])
    } catch (err) {
      const msg = err.response?.data?.message || 'AI query failed'
      if (err.response?.data?.code === 'AI_QUOTA_EXCEEDED') {
        setConversation((prev) => [
          ...prev,
          { role: 'assistant', content: msg + ' — Upgrade to Pro for unlimited AI access.', upgradePrompt: true },
        ])
      } else {
        setConversation((prev) => [
          ...prev,
          { role: 'assistant', content: msg },
        ])
      }
    } finally {
      setLoading(false)
    }
  }, [query, loading, channelId, workspaceId])

  const handleSummarize = useCallback(async () => {
    if (!channelId || summaryLoading) return
    setSummaryLoading(true)
    setSummary(null)
    try {
      const { data } = await aiApi.summarizeChannel(channelId)
      setSummary(data)
    } catch {
      setSummary({ summary: 'Failed to generate summary.', keyPoints: [], tasks: [], decisions: [] })
    } finally {
      setSummaryLoading(false)
    }
  }, [channelId, summaryLoading])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk() }
    if (e.key === 'Escape') onClose?.()
  }

  const tabBtn = (name, active) => ({
    flex: 1, padding: '8px 0', border: 'none',
    backgroundColor: 'transparent',
    color: active ? '#6366f1' : '#8696a0',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
    transition: 'color 0.15s, border-color 0.15s',
  })

  return (
    <div
      style={{
        width: 360,
        borderLeft: '1px solid #e9edef',
        backgroundColor: '#f0f2f5',
        display: 'flex', flexDirection: 'column',
        height: '100%', flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #e9edef',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="rgba(255,255,255,0.8)">
            <path d="M8 0a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.445Z"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', backgroundColor: 'transparent',
            cursor: 'pointer', padding: '4px', borderRadius: '50%',
            color: 'rgba(255,255,255,0.8)', lineHeight: 1, fontSize: 12,
          }}
          title="Close AI panel"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z"/>
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e9edef', backgroundColor: '#fff' }}>
        <button onClick={() => setTab('chat')} style={tabBtn('Chat', tab === 'chat')}>Chat</button>
        <button onClick={() => { setTab('summarize'); if (!summary) handleSummarize() }} style={tabBtn('Summarize', tab === 'summarize')}>Summarize</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {tab === 'chat' && (
          <>
            {conversation.length === 0 && (
              <div style={{ fontSize: 13, color: '#8696a0', textAlign: 'center', padding: 24, lineHeight: 1.6 }}>
                Ask me anything about this channel!
                <div style={{ fontSize: 11, color: '#8696a0', marginTop: 4 }}>
                  Try: "What was discussed today?" or "List action items"
                </div>
              </div>
            )}
            {conversation.map((msg, i) => (
              <div key={i} style={{
                marginBottom: 10,
                padding: '8px 12px',
                borderRadius: msg.role === 'user' ? '8px 0px 8px 8px' : '0px 8px 8px 8px',
                boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
                backgroundColor: msg.role === 'user' ? '#eef2ff' : '#fff',
                border: '1px solid #e9edef',
                fontSize: 13, color: '#111b21', lineHeight: 1.5,
                maxWidth: '85%',
                marginLeft: msg.role === 'user' ? 'auto' : 0,
                marginRight: msg.role === 'user' ? 0 : 'auto',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#667781', marginBottom: 3 }}>
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                {msg.upgradePrompt && (
                  <div style={{ marginTop: 6 }}>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-upgrade-modal'))}
                      style={{
                        padding: '5px 12px', borderRadius: 6, border: 'none',
                        backgroundColor: '#6366f1', color: '#fff',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{
                padding: '8px 12px', borderRadius: '0px 8px 8px 8px',
                boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
                backgroundColor: '#fff', border: '1px solid #e9edef',
                fontSize: 13, color: '#8696a0', maxWidth: '85%',
              }}>
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}

        {tab === 'summarize' && (
          <>
            {summaryLoading && (
              <div style={{ textAlign: 'center', padding: 24, color: '#8696a0', fontSize: 13 }}>
                Generating summary...
              </div>
            )}
            {summary && (
              <div>
                <div style={{
                  padding: 12,
                  backgroundColor: '#fff', borderRadius: 6,
                  border: '1px solid #e9edef', marginBottom: 10,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#667781', marginBottom: 3 }}>
                    Summary
                  </div>
                  <div style={{ fontSize: 13, color: '#111b21', lineHeight: 1.6 }}>
                    {summary.summary}
                  </div>
                </div>

                {summary.keyPoints?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#667781', marginBottom: 4 }}>Key Points</div>
                    {summary.keyPoints.map((kp, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                        padding: '6px 10px', backgroundColor: '#fff',
                        borderRadius: 6, border: '1px solid #e9edef',
                        marginBottom: 4, fontSize: 12, color: '#111b21',
                      }}>
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="#6366f1" style={{ marginTop: 2, flexShrink: 0 }}>
                          <path d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 7A3.5 3.5 0 0 0 4.5 12v.5c0 .28.22.5.5.5h6c.28 0 .5-.22.5-.5V12A3.5 3.5 0 0 0 8 8Z"/>
                        </svg>
                        {kp}
                      </div>
                    ))}
                  </div>
                )}

                {summary.tasks?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#667781', marginBottom: 4 }}>Action Items</div>
                    {summary.tasks.map((task, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                        padding: '6px 10px', backgroundColor: '#fff',
                        borderRadius: 6, border: '1px solid #e9edef',
                        marginBottom: 4, fontSize: 12, color: '#111b21',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="#6366f1" style={{ marginTop: 2, flexShrink: 0 }}>
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                        </svg>
                        {task.task || task}
                      </div>
                    ))}
                  </div>
                )}

                {summary.decisions?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#667781', marginBottom: 4 }}>Decisions</div>
                    {summary.decisions.map((dec, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                        padding: '6px 10px', backgroundColor: '#fff',
                        borderRadius: 6, border: '1px solid #e9edef',
                        marginBottom: 4, fontSize: 12, color: '#111b21',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="#8696a0" style={{ marginTop: 2, flexShrink: 0 }}>
                          <path d="M2.5 1.75a.25.25 0 0 1 .25-.25h5.5a.25.25 0 0 1 .25.25v7.5a.25.25 0 0 1-.25.25h-5.5a.25.25 0 0 1-.25-.25v-7.5ZM6 10.5H2.5A1.75 1.75 0 0 1 .75 8.75v-7.5C.75.34 1.59 0 2.5 0h5.5c.91 0 1.75.34 1.75 1.25v7.5c0 .91-.84 1.75-1.75 1.75H6v1.5h3.25a.75.75 0 0 1 0 1.5H6v2.5a.75.75 0 0 1-1.5 0V13H2.5a.75.75 0 0 1 0-1.5H6V10.5Z"/>
                        </svg>
                        {dec}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSummarize}
                  style={{
                    marginTop: 8, padding: '7px 14px', borderRadius: 6,
                    border: '1px solid #e9edef', backgroundColor: '#fff',
                    color: '#111b21', fontSize: 12, cursor: 'pointer',
                    width: '100%', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e9edef'}
                >
                  Refresh Summary
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {tab === 'chat' && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #e9edef', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI..."
              style={{
                flex: 1,
                padding: '7px 10px',
                border: '1px solid #e9edef',
                borderRadius: 6,
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                color: '#111b21',
                backgroundColor: '#f0f2f5',
              }}
            />
            <button
              onClick={handleAsk}
              disabled={loading || !query.trim()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '7px 14px', borderRadius: 6, border: 'none',
                backgroundColor: loading || !query.trim() ? '#e9edef' : '#6366f1',
                color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1.75v12.5a.75.75 0 0 0 1.03.69l12.5-6.25a.75.75 0 0 0 0-1.38L2.53 1.06A.75.75 0 0 0 1.5 1.75Z"/>
              </svg>
              Ask
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
