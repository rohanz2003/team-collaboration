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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        gap: 10,
        marginBottom: 16,
        position: 'relative',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: isOwn ? '#3182ce' : '#a0aec0',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {isDeleted ? '🚫' : (msg.sender?.name?.charAt(0).toUpperCase() || '?')}
      </div>
      <div style={{ maxWidth: '70%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            marginBottom: 2,
            flexDirection: isOwn ? 'row-reverse' : 'row',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2d3748' }}>
            {isDeleted ? 'Deleted' : (msg.sender?.name || 'Unknown')}
          </span>
          <span style={{ fontSize: 11, color: '#a0aec0' }}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {msg.edited && !isDeleted && (
            <span style={{ fontSize: 10, color: '#a0aec0' }}>(edited)</span>
          )}
        </div>

        {msg.replyTo && !isDeleted && (
          <div
            style={{
              fontSize: 11,
              color: '#718096',
              marginBottom: 2,
              padding: '2px 8px',
              borderLeft: '2px solid #3182ce',
              backgroundColor: '#f7fafc',
              borderRadius: 4,
              display: 'inline-block',
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
              padding: '6px 14px',
              borderRadius: 12,
              backgroundColor: '#f7fafc',
              color: '#a0aec0',
              fontSize: 13,
              fontStyle: 'italic',
            }}
          >
            Message deleted
          </div>
        ) : isFile ? (
          <MessageFile msg={msg} />
        ) : (
          <div
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              backgroundColor: isOwn ? '#bee3f8' : '#edf2f7',
              color: '#1a202c',
              fontSize: 14,
              lineHeight: 1.5,
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
              border: 'none',
              backgroundColor: 'transparent',
              color: '#3182ce',
              fontSize: 11,
              cursor: 'pointer',
              padding: '2px 0',
              marginTop: 2,
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
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0' }}>
        Loading messages...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', fontSize: 15 }}>
        No messages yet. Start the conversation!
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
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
