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
  const colors = ['#075E54', '#128C7E', '#25D366', '#34B7F1']
  const colorIdx = (msg.sender?._id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length

  const bubbleStyle = {
    padding: '6px 12px',
    borderRadius: isOwn ? '8px 0px 8px 8px' : '0px 8px 8px 8px',
    backgroundColor: isOwn ? '#dcf8c6' : '#ffffff',
    color: '#111b21',
    fontSize: 14, lineHeight: 1.45,
    wordBreak: 'break-word',
    boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
    position: 'relative',
  }

  return (
    <div
      id={`msg-${msg._id}`}
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        gap: 8,
        marginBottom: 2,
        position: 'relative',
        padding: '3px 16px',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          backgroundColor: isDeleted ? '#e9edef' : colors[colorIdx],
          color: '#fff', flexShrink: 0, marginTop: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600,
        }}>
          {isDeleted ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5h-.5l-.721 9.673A1.75 1.75 0 0 1 10.282 16H5.718a1.75 1.75 0 0 1-1.747-1.827L3.25 4.5h-.5a.75.75 0 0 1 0-1.5H5V1.75A1.75 1.75 0 0 1 6.75 0h2.5A1.75 1.75 0 0 1 11 1.75Z"/>
            </svg>
          ) : initial}
        </div>
      )}
      <div style={{ maxWidth: '75%', minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            marginBottom: 1,
            flexDirection: isOwn ? 'row-reverse' : 'row',
            paddingLeft: isOwn ? 0 : 2,
          }}
        >
          {!isOwn && (
            <span style={{ fontSize: 11, fontWeight: 600, color: colors[colorIdx] }}>
              {msg.sender?.name || 'Unknown'}
            </span>
          )}
        </div>

        {msg.replyTo && !isDeleted && (
          <div style={{
            fontSize: 11, color: '#667781', marginBottom: 2,
            padding: '3px 10px',
            borderLeft: `2px solid ${isOwn ? '#25D366' : '#075E54'}`,
            display: 'inline-block',
            maxWidth: '100%', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            backgroundColor: isOwn ? '#c6ed9e' : '#f5f6f6',
            borderRadius: '4px 4px 0 4px',
            marginTop: 2,
          }}>
            <span style={{ fontWeight: 600 }}>
              {msg.replyTo.sender?.name || 'Unknown'}
            </span>
            : {msg.replyTo.text || (msg.replyTo.messageType === 'file' ? msg.replyTo.fileName : '')}
          </div>
        )}

        {isDeleted ? (
          <div style={{
            padding: '4px 12px', borderRadius: 8,
            backgroundColor: '#f0f2f5', color: '#8696a0',
            fontSize: 12, fontStyle: 'italic',
          }}>
            Message deleted
          </div>
        ) : isFile ? (
          <div style={bubbleStyle}>
            <MessageFile msg={msg} />
          </div>
        ) : (
          <div style={bubbleStyle}>
            {msg.text}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 2,
              justifyContent: 'flex-end', marginTop: 2,
              fontSize: 11, color: '#667781',
            }}>
              {msg.edited && <span style={{ fontSize: 10 }}>edited</span>}
              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
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
              color: '#075E54', fontSize: 11, fontWeight: 500,
              cursor: 'pointer', padding: '1px 4px', marginTop: 1,
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
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8696a0', fontSize: 14, backgroundColor: '#efeae2' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: 8, animation: 'spin 1s linear infinite' }}>
          <path d="M8 0a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 0Zm0 10a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 10Z"/>
        </svg>
        Loading messages...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#efeae2' }}>
        <svg width="40" height="40" viewBox="0 0 16 16" fill="#8696a0">
          <path d="M1.5 2h13a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5Zm0-1A1.5 1.5 0 0 0 0 2.5v8A1.5 1.5 0 0 0 1.5 12h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 1h-13Z"/>
          <path d="M8 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
          <path d="M12.5 10.5A3.5 3.5 0 0 0 9 7H7a3.5 3.5 0 0 0-3.5 3.5v.5h9v-.5Z"/>
        </svg>
        <span style={{ color: '#8696a0', fontSize: 14 }}>No messages yet. Start the conversation!</span>
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 0',
        backgroundColor: '#efeae2',
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
