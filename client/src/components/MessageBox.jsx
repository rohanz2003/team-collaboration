import { useEffect, useRef, memo, useState } from 'react'
import { useAuth } from '../store/authStore'
import MessageFile from './MessageFile'
import ReactionBar from './ReactionBar'
import MessageActions from './MessageActions'
import {
  useEditingId,
  useEditingText,
  useReplyToData,
  useThreadParentId,
  useThreadReplies,
} from '../store/messageStore'

function Message({ msg, isOwn, onReact, onEdit, onDelete, onReply, onOpenThread }) {
  const [showActions, setShowActions] = useState(false)
  const editingId = useEditingId()
  const isEditing = editingId === msg._id

  const isFile = msg.messageType === 'file'
  const isDeleted = msg.deleted

  const initial = (msg.sender?.name?.charAt(0) || '?').toUpperCase()
  const colors = ['#0969da', '#8250df', '#cf222e', '#1a7f37', '#bf3989', '#633c01']
  const colorIdx = (msg.sender?._id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length

  return (
    <div
      id={`msg-${msg._id}`}
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        gap: 10,
        marginBottom: 4,
        position: 'relative',
        padding: '6px 16px',
        borderRadius: 6,
        transition: 'background-color 0.1s',
      }}
      onMouseEnter={(e) => { setShowActions(true); e.currentTarget.style.backgroundColor = '#f6f8fa' }}
      onMouseLeave={(e) => { setShowActions(false); e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <div
        style={{
          width: 32, height: 32, borderRadius: '50%',
          backgroundColor: isDeleted ? '#d0d7de' : colors[colorIdx],
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600,
          flexShrink: 0, marginTop: 1,
        }}
      >
        {isDeleted ? (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5h-.5l-.721 9.673A1.75 1.75 0 0 1 10.282 16H5.718a1.75 1.75 0 0 1-1.747-1.827L3.25 4.5h-.5a.75.75 0 0 1 0-1.5H5V1.75A1.75 1.75 0 0 1 6.75 0h2.5A1.75 1.75 0 0 1 11 1.75ZM5.75 6.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z"/>
          </svg>
        ) : initial}
      </div>
      <div style={{ maxWidth: '72%', minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            marginBottom: 2,
            flexDirection: isOwn ? 'row-reverse' : 'row',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: '#0d1117' }}>
            {isDeleted ? 'Deleted' : (msg.sender?.name || 'Unknown')}
          </span>
          <span style={{ fontSize: 11, color: '#656d76' }}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {msg.edited && !isDeleted && (
            <span style={{ fontSize: 10, color: '#8b949e' }}>edited</span>
          )}
        </div>

        {msg.replyTo && !isDeleted && (
          <div
            style={{
              fontSize: 11, color: '#656d76', marginBottom: 2,
              padding: '2px 10px',
              borderLeft: '2px solid #0969da',
              borderRadius: 0,
              display: 'inline-block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontWeight: 600 }}>
              {msg.replyTo.sender?.name || 'Unknown'}
            </span>
            : {msg.replyTo.text || (msg.replyTo.messageType === 'file' ? msg.replyTo.fileName : '')}
          </div>
        )}

        {isDeleted ? (
          <div
            style={{
              padding: '4px 12px', borderRadius: 6,
              backgroundColor: '#f6f8fa', color: '#8b949e',
              fontSize: 12, fontStyle: 'italic',
            }}
          >
            Message deleted
          </div>
        ) : isFile ? (
          <MessageFile msg={msg} />
        ) : (
          <div
            style={{
              padding: '6px 12px', borderRadius: 6,
              backgroundColor: isOwn ? '#ddf4ff' : '#f6f8fa',
              color: '#0d1117',
              fontSize: 14, lineHeight: 1.45,
              wordBreak: 'break-word',
            }}
          >
            {msg.text}
          </div>
        )}

        {!isDeleted && (
          <ReactionBar
            messageId={msg._id}
            reactions={msg.reactions || []}
            onReact={onReact}
          />
        )}

        {!isDeleted && msg.replyTo && (
          <button
            onClick={() => onOpenThread?.(msg._id)}
            style={{
              border: 'none', backgroundColor: 'transparent',
              color: '#0969da', fontSize: 11, fontWeight: 500,
              cursor: 'pointer', padding: '1px 0',
              marginTop: 1,
            }}
          >
            View thread
          </button>
        )}

        {showActions && (
          <MessageActions
            isOwn={isOwn}
            messageId={msg._id}
            onEdit={() => onEdit?.(msg)}
            onDelete={onDelete}
            onReply={onReply}
            isDeleted={isDeleted}
          />
        )}
      </div>
    </div>
  )
}

const MemoizedMessage = memo(Message)

export default function MessageBox({
  messages,
  loading,
  onReact,
  onEdit,
  onDelete,
  onReply,
  onOpenThread,
}) {
  const { user } = useAuth()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', fontSize: 14 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: 8, animation: 'spin 1s linear infinite' }}>
          <path d="M8 0a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 0Zm0 10a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 10Zm4.384-5.984a.75.75 0 0 1 0 1.06l-1.768 1.768a.75.75 0 0 1-1.06-1.06l1.767-1.768a.75.75 0 0 1 1.06 0Zm-8.84 8.84a.75.75 0 0 1 0-1.06l1.768-1.768a.75.75 0 0 1 1.06 1.06l-1.767 1.768a.75.75 0 0 1-1.06 0Zm10.9-2.564a.75.75 0 0 1-.367.99l-2.317 1.012a.75.75 0 0 1-.622-1.364l2.317-1.012a.75.75 0 0 1 .99.366l-.001.008Zm-10.2-5.784a.75.75 0 0 1-.367.99L1.596 5.587a.75.75 0 0 1-.622-1.364l2.317-1.012a.75.75 0 0 1 .99.366l-.001.008Z"/>
        </svg>
        Loading messages...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <svg width="32" height="32" viewBox="0 0 16 16" fill="#d0d7de">
          <path d="M1.5 2h13a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5Zm0-1A1.5 1.5 0 0 0 0 2.5v8A1.5 1.5 0 0 0 1.5 12h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 1h-13Z"/>
          <path d="M8 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
          <path d="M12.5 10.5A3.5 3.5 0 0 0 9 7H7a3.5 3.5 0 0 0-3.5 3.5v.5h9v-.5Z"/>
        </svg>
        <span style={{ color: '#8b949e', fontSize: 14 }}>No messages yet. Start the conversation!</span>
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 16px',
      }}
    >
      {messages.map((msg) => (
        <MemoizedMessage
          key={msg._id}
          msg={msg}
          isOwn={user?._id === msg.sender?._id}
          onReact={onReact}
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
          onOpenThread={onOpenThread}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
