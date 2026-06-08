import { useState, useCallback, useRef } from 'react'

export default function MessageInput({ onSend, onTyping, onStopTyping, fileUpload }) {
  const [text, setText] = useState('')
  const typingTimeout = useRef(null)

  const handleChange = useCallback(
    (e) => {
      setText(e.target.value)
      onTyping?.()
      clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => {
        onStopTyping?.()
      }, 1500)
    },
    [onTyping, onStopTyping]
  )

  const handleSend = useCallback(() => {
    if (!text.trim()) return
    onSend?.(text.trim())
    setText('')
    onStopTyping?.()
    clearTimeout(typingTimeout.current)
  }, [text, onSend, onStopTyping])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div
      style={{
        padding: '16px 32px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
        }}
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
            padding: '10px 14px',
            border: '1px solid #cbd5e0',
            borderRadius: 8,
            fontSize: 14,
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.4,
            maxHeight: 120,
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
            padding: '10px 24px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: text.trim() ? '#3182ce' : '#cbd5e0',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
