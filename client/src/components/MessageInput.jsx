import { useState, useCallback, useRef } from 'react'

export default function MessageInput({ onSend, onTyping, onStopTyping, fileUpload }) {
  const [text, setText] = useState('')
  const typingTimeout = useRef(null)

  const handleChange = useCallback((e) => {
    setText(e.target.value)
    onTyping?.()
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => onStopTyping?.(), 1500)
  }, [onTyping, onStopTyping])

  const handleSend = useCallback(() => {
    if (!text.trim()) return
    onSend?.(text.trim())
    setText('')
    onStopTyping?.()
    clearTimeout(typingTimeout.current)
  }, [text, onSend, onStopTyping])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div style={{
      padding: '12px 24px 16px',
      backgroundColor: '#fff',
    }}>
      <div style={{
        display: 'flex', gap: 8, alignItems: 'flex-end',
        border: '1px solid #d0d7de',
        borderRadius: 8,
        padding: '6px 6px 6px 14px',
        backgroundColor: '#f6f8fa',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
        onFocusCapture={() => {
          const parent = document.getElementById('msg-input-container')
          if (parent) { parent.style.borderColor = '#0969da'; parent.style.backgroundColor = '#fff' }
        }}
        onBlurCapture={() => {
          const parent = document.getElementById('msg-input-container')
          if (parent) { parent.style.borderColor = '#d0d7de'; parent.style.backgroundColor = '#f6f8fa' }
        }}
        id="msg-input-container"
      >
        {fileUpload}

        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            fontSize: 14,
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.4,
            maxHeight: 120,
            backgroundColor: 'transparent',
            color: '#0d1117',
          }}
          onInput={(e) => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 18px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: text.trim() ? '#0969da' : '#d0d7de',
            color: text.trim() ? '#fff' : '#8b949e',
            fontSize: 13,
            fontWeight: 600,
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { if (text.trim()) e.currentTarget.style.backgroundColor = '#0550ae' }}
          onMouseLeave={(e) => { if (text.trim()) e.currentTarget.style.backgroundColor = '#0969da' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.5 1.75v12.5a.75.75 0 0 0 1.03.69l12.5-6.25a.75.75 0 0 0 0-1.38L2.53 1.06A.75.75 0 0 0 1.5 1.75Z"/>
          </svg>
          Send
        </button>
      </div>
    </div>
  )
}
