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
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '1px 6px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            fontSize: 12,
            cursor: 'pointer',
            lineHeight: '20px',
          }}
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '1px solid #e2e8f0',
          backgroundColor: '#fff',
          fontSize: 14,
          cursor: 'pointer',
          color: '#718096',
          lineHeight: 1,
        }}
        title="Add reaction"
      >
        +
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
            border: '1px solid #e2e8f0',
            borderRadius: 20,
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
