import { useState } from 'react'

export default function ReplyBox({
  replyToData,
  onCancelReply,
  onSendReply,
}) {
  const [text, setText] = useState('')

  if (!replyToData) return null

  const handleSend = () => {
    if (!text.trim()) return
    onSendReply?.(replyToData._id, text.trim())
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        padding: '8px 32px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f7fafc',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6,
          fontSize: 12,
          color: '#4a5568',
        }}
      >
        <span style={{ color: '#3182ce' }}>↩</span>
        <span>
          Replying to{' '}
          <strong>{replyToData.sender?.name || 'Unknown'}</strong>
        </span>
        <span
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#a0aec0',
          }}
        >
          {replyToData.deleted
            ? '[deleted]'
            : replyToData.text || (replyToData.messageType === 'file' ? replyToData.fileName : '')}
        </span>
        <button
          onClick={onCancelReply}
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: 16,
            color: '#a0aec0',
            padding: 0,
            lineHeight: 1,
          }}
          title="Cancel reply"
        >
          ✕
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a reply..."
          rows={1}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #cbd5e0',
            borderRadius: 6,
            fontSize: 13,
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: text.trim() ? '#3182ce' : '#cbd5e0',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: text.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Reply
        </button>
      </div>
    </div>
  )
}
