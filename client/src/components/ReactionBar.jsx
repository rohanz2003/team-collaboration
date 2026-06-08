import { useState } from 'react'

const EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '😢', '😡', '👏']

export default function ReactionBar({ messageId, reactions = [], onReact }) {
  const [open, setOpen] = useState(false)

  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, {})

  const uniqueReactions = Object.entries(reactionCounts)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, position: 'relative' }}>
      {uniqueReactions.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={(e) => {
            e.stopPropagation()
            onReact?.(messageId, emoji)
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: '1px 6px', borderRadius: 6,
            border: '1px solid #d0d7de', backgroundColor: '#fff',
            fontSize: 12, cursor: 'pointer', lineHeight: '20px',
            transition: 'border-color 0.1s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0969da'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d0d7de'}
          title={emoji}
        >
          <span>{emoji}</span>
          {count > 1 && (
            <span style={{ fontSize: 11, color: '#718096' }}>{count}</span>
          )}
        </button>
      ))}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, borderRadius: 6,
          border: '1px solid #d0d7de', backgroundColor: '#fff',
          cursor: 'pointer', color: '#656d76', lineHeight: 1,
          transition: 'border-color 0.1s, background-color 0.1s',
        }}
        title="Add reaction"
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0969da'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d0d7de'}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-3a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5A.75.75 0 0 1 8 5Z"/>
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: 0,
            display: 'flex',
            gap: 2,
            padding: '4px 8px',
            backgroundColor: '#fff',
            border: '1px solid #d0d7de',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 10,
          }}
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation()
                onReact?.(messageId, emoji)
                setOpen(false)
              }}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: 18,
                cursor: 'pointer',
                padding: 2,
                lineHeight: 1,
                transition: 'transform 0.1s',
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.3)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
