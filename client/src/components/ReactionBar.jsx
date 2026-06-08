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
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, position: 'relative', flexWrap: 'wrap' }}>
      {uniqueReactions.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={(e) => { e.stopPropagation(); onReact?.(messageId, emoji) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: '1px 5px', borderRadius: 10,
            border: '1px solid #e9edef', backgroundColor: '#fff',
            fontSize: 11, cursor: 'pointer', lineHeight: '18px',
            transition: 'border-color 0.1s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#25D366'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e9edef'}
          title={emoji}
        >
          <span>{emoji}</span>
          {count > 1 && (
            <span style={{ fontSize: 10, color: '#667781' }}>{count}</span>
          )}
        </button>
      ))}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, borderRadius: '50%',
          border: '1px solid #e9edef', backgroundColor: '#fff',
          cursor: 'pointer', color: '#8696a0', lineHeight: 1, fontSize: 14,
          transition: 'border-color 0.1s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#25D366'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e9edef'}
        title="Add reaction"
      >
        +
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 26,
            left: 0,
            display: 'flex', gap: 3,
            padding: '6px 10px',
            backgroundColor: '#fff',
            border: '1px solid #e9edef',
            borderRadius: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            zIndex: 10,
          }}
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => { e.stopPropagation(); onReact?.(messageId, emoji); setOpen(false) }}
              style={{
                border: 'none', backgroundColor: 'transparent',
                fontSize: 20, cursor: 'pointer', padding: 2,
                lineHeight: 1, transition: 'transform 0.1s',
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
