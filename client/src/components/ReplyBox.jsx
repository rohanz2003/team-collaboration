import { useState } from 'react'

export default function ReplyBox({ replyToData, onCancelReply, onSendReply }) {
  const [text, setText] = useState('')

  if (!replyToData) return null

  const handleSend = () => {
    if (!text.trim()) return
    onSendReply?.(replyToData._id, text.trim())
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div style={{
      padding: '6px 10px',
      backgroundColor: '#f0f2f5',
      borderTop: '1px solid #e9edef',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 4, fontSize: 12, color: '#667781',
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="#075E54">
          <path d="M1.75 2.5a.75.75 0 0 0-.75.75v6.5c0 .414.336.75.75.75h8a.75.75 0 0 0 .75-.75.75.75 0 0 1 1.5 0v.5A2.25 2.25 0 0 1 9.75 12h-8A2.25 2.25 0 0 1 1.5 9.75v-6.5A2.25 2.25 0 0 1 3.75 1h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 0-.75.75v3.5h8.5v-.5a.75.75 0 0 1 1.5 0v.5h1.25a.75.75 0 0 1 .705 1.064l-2 4.5a.75.75 0 0 1-1.34-.033l-.026-.054-.104-.25H5.75a.75.75 0 0 1 0-1.5h1.965l.277-.623H3.75a.75.75 0 0 1-.75-.75V3.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5H3.75v2.5h8.5v-.5a.75.75 0 0 1 1.5 0v1.25a.75.75 0 0 1-.75.75h-1.25l-.75 1.5H9.75a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5v-2.5H1.75Z"/>
        </svg>
        <span>
          Replying to <strong>{replyToData.sender?.name || 'Unknown'}</strong>
        </span>
        <span style={{
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', color: '#8696a0',
        }}>
          {replyToData.deleted ? '[deleted]' : replyToData.text || (replyToData.messageType === 'file' ? replyToData.fileName : '')}
        </span>
        <button
          onClick={onCancelReply}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', backgroundColor: 'transparent',
            cursor: 'pointer', padding: '4px', borderRadius: '50%',
            color: '#8696a0', lineHeight: 1, flexShrink: 0,
          }}
          title="Cancel reply"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z"/>
          </svg>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your reply..."
          rows={1}
          style={{
            flex: 1, padding: '7px 10px',
            border: '1px solid #e9edef', borderRadius: 6,
            fontSize: 13, resize: 'none', outline: 'none',
            fontFamily: 'inherit', backgroundColor: '#fff', color: '#111b21',
          }}
          onInput={(e) => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '8px', borderRadius: '50%', border: 'none',
            backgroundColor: text.trim() ? '#25D366' : '#e9edef',
            color: '#fff', width: 36, height: 36,
            cursor: text.trim() ? 'pointer' : 'not-allowed', alignSelf: 'flex-end',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.5 1.75v12.5a.75.75 0 0 0 1.03.69l12.5-6.25a.75.75 0 0 0 0-1.38L2.53 1.06A.75.75 0 0 0 1.5 1.75Z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
