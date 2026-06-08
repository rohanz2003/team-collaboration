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

  const inputIcon = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '6px', borderRadius: '50%',
    color: '#8696a0', lineHeight: 1, flexShrink: 0,
    transition: 'background-color 0.15s',
  }

  return (
    <div style={{
      padding: '6px 10px 8px',
      backgroundColor: '#f0f2f5',
    }}>
      <div style={{
        display: 'flex', gap: 4, alignItems: 'center',
        borderRadius: 8,
        padding: '2px 4px',
        backgroundColor: '#fff',
      }}>
        {fileUpload}

        <button
          style={inputIcon}
          title="Emoji"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f2f5' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm5.25-1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm5.5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM5.34 9.72a.75.75 0 0 1 1.055.14c.392.495.97.89 1.605.89s1.213-.395 1.605-.89a.75.75 0 0 1 1.115.155.75.75 0 0 1-.555.195 3.19 3.19 0 0 1-4.33 0 .75.75 0 0 1-.495-.49Z"/>
          </svg>
        </button>

        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          rows={1}
          style={{
            flex: 1,
            padding: '8px 4px',
            border: 'none',
            fontSize: 14,
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.4,
            maxHeight: 120,
            backgroundColor: 'transparent',
            color: '#111b21',
          }}
          onInput={(e) => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />

        {text.trim() ? (
          <button
            onClick={handleSend}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '8px', borderRadius: '50%', border: 'none',
              backgroundColor: '#075E54', color: '#fff',
              cursor: 'pointer', flexShrink: 0, width: 38, height: 38,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#054d44'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#075E54'}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.5 1.75v12.5a.75.75 0 0 0 1.03.69l12.5-6.25a.75.75 0 0 0 0-1.38L2.53 1.06A.75.75 0 0 0 1.5 1.75Z"/>
            </svg>
          </button>
        ) : (
          <button
            style={inputIcon}
            title="Voice message"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f2f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.326 2.484a.75.75 0 0 1 1.033.248c.382.599.946 1.394 1.711 2.324a.75.75 0 0 1-1.184.92c-.724-.88-1.248-1.614-1.606-2.16a.75.75 0 0 1 .246-1.032ZM12.674 2.484a.75.75 0 0 1 .246 1.032c-.358.546-.882 1.28-1.606 2.16a.75.75 0 1 1-1.184-.92c.765-.93 1.329-1.726 1.711-2.324a.75.75 0 0 1 1.033-.248ZM8 4a3 3 0 0 0-3 3v2a3 3 0 1 0 6 0V7a3 3 0 0 0-3-3Zm-4.5 3a4.5 4.5 0 1 1 9 0v2a4.5 4.5 0 0 1-9 0Z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
