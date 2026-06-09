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
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 640 512" fill="rgba(255,255,255,0.8)">
            <path d="M86.3 197.8c-8-.1-15.9 1.7-23.1 5.1s-13.5 8.6-18.4 14.9l0-61.9c0-2.2-.9-4.3-2.4-5.8s-3.6-2.4-5.8-2.4l-28.4 0c-2.2 0-4.3 .9-5.8 2.4S0 153.8 0 156L0 333.6c0 1.1 .2 2.1 .6 3.1s1 1.9 1.8 2.7 1.7 1.4 2.7 1.8 2.1 .6 3.1 .6l28.4 0c1.1 0 2.1-.2 3.1-.6s1.9-1 2.7-1.8 1.4-1.7 1.8-2.7 .6-2.1 .6-3.1l0-8.1c11.6 13.4 25.9 19.8 41.6 19.8 34.6 0 61.9-26.2 61.9-73.8 0-45.9-27-73.6-61.9-73.6zM71.5 305.7c-9.6 0-21.2-4.9-26.7-12.5l0-43c5.5-7.6 17.2-12.8 26.7-12.8 17.7 0 31.1 13.1 31.1 34 0 21.2-13.4 34.3-31.1 34.3zm156.4-59a17.4 17.4 0 1 0 0 34.8 17.4 17.4 0 1 0 0-34.8zm46.1-90l0-44.7c2.8-1.2 5.2-3.3 6.6-6s1.9-5.8 1.3-8.9-2.2-5.7-4.6-7.7-5.4-3-8.4-3-6.1 1.1-8.4 3-4 4.7-4.6 7.7-.1 6.1 1.3 8.9 3.8 4.8 6.6 6l0 44.7c-28 1.3-54.4 13.6-73.6 34.1s-29.5 47.7-28.8 75.8 12.3 54.7 32.4 74.3 47 30.6 75.1 30.6 55-11 75.1-30.6 31.7-46.3 32.4-74.3-9.7-55.3-28.8-75.8-45.5-32.8-73.6-34.1zm86 107.4c0 30.5-40.8 55.3-91.1 55.3s-91.1-24.7-91.1-55.3 40.8-55.3 91.1-55.3 91.1 24.7 91.1 55.3l0 0zm-50.2 17.4c3.4 0 6.8-1 9.7-2.9s5.1-4.6 6.4-7.8 1.7-6.7 1-10.1-2.3-6.5-4.8-8.9-5.5-4.1-8.9-4.8-6.9-.3-10.1 1-5.9 3.5-7.8 6.4-2.9 6.2-2.9 9.7c0 4.6 1.8 9 5.1 12.3s7.7 5.1 12.3 5.1l0 0zm270.9-31c-14.8-2.6-22.4-3.8-22.4-9.9 0-5.5 7.3-9.9 17.7-9.9 12.2 .1 24.2 3.6 34.5 10.1 1.8 1.2 4 1.6 6.2 1.1s4-1.7 5.1-3.6c.1-.1 .1-.2 .2-.3l8.6-14.9c1.1-1.9 1.4-4.1 .8-6.1s-1.9-3.9-3.7-5c-15.7-9.4-33.7-14.3-52-14.1-39 0-60.2 21.5-60.2 46.2 0 36.3 33.7 41.9 57.6 45.6 13.4 2.3 24.1 4.4 24.1 11 0 6.4-5.5 10.8-18.9 10.8-13.6 0-31-6.2-42.6-13.6-.9-.6-1.9-1-3-1.2s-2.1-.2-3.2 .1-2.1 .7-2.9 1.3-1.6 1.4-2.2 2.3c0 .1-.1 .1-.1 .2l-10.2 16.9c-1.1 1.8-1.4 4-1 6s1.7 3.9 3.5 5c15.2 10.3 37.7 16.7 59.4 16.7 40.4 0 64-19.8 64-46.5 0-38.1-35.5-43.9-59.3-48.3zm-95.9 60.8c-.5-2-1.8-3.7-3.6-4.8s-3.9-1.5-5.9-1.1c-1.4 .3-2.8 .4-4.2 .4-7.8 0-12.5-6.1-12.5-14.2l0-51.2 20.3 0c2.2 0 4.2-.9 5.8-2.4s2.4-3.6 2.4-5.8l0-22.7c0-2.2-.9-4.2-2.4-5.8s-3.6-2.4-5.8-2.4l-20.3 0 0-30.2c0-2.2-.9-4.2-2.4-5.8s-3.6-2.4-5.8-2.4l-28.2 0c-2.2 0-4.2 .9-5.8 2.4s-2.4 3.6-2.4 5.8l0 30.2-15.1 0c-1.1 0-2.1 .2-3.1 .6s-1.9 1-2.6 1.8-1.4 1.7-1.8 2.6-.6 2-.6 3.1l0 22.7c0 1.1 .2 2.1 .6 3.1s1 1.9 1.8 2.6 1.7 1.4 2.6 1.8 2 .6 3.1 .6l15.1 0 0 63.7c0 27 15.4 41.3 43.9 41.3 12.2 0 21.4-2.2 27.6-5.4 1.6-.8 2.9-2.2 3.7-3.9s.9-3.6 .5-5.4l-5-19.3z"/>
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
