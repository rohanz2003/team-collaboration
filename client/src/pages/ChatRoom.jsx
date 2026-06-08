import { useEffect, useCallback, useRef, useState } from 'react'
import { useCurrentChannel } from '../store/workspaceStore'
import useAuthStore, { useAuth, useUpdateUser } from '../store/authStore'
import useMessageStore, { useReplyToData } from '../store/messageStore'
import useSubscriptionStore, { useIsPro, usePlan } from '../store/subscriptionStore'
import {
  useMessages,
  useFetchMessages,
  useAddMessage,
  useUpdateMessage,
  useRemoveMessage,
  useSetTyping,
  useClearTyping,
  useSetOnlineUsers,
  useClearChat,
  useChatLoading,
  useTypingUsers,
  useOnlineUsers,
} from '../store/chatStore'
import useCallStore, { useIncomingCall, useInCall, useCallAccepted } from '../store/callStore'
import { getLocalStream, createPeerConnection, createOffer, createAnswer, setRemoteDescription, addIceCandidate, addLocalTracks } from '../utils/webRTC'
import { getScreenStream, replaceVideoTrack, stopScreenStream } from '../utils/screenShare'
import { connectSocket, getSocket } from '../socket'
import { messageApi } from '../api/message'
import MessageBox from '../components/MessageBox'
import MessageInput from '../components/MessageInput'
import FileUpload from '../components/FileUpload'
import IncomingCall from '../components/IncomingCall'
import VideoCall from '../components/VideoCall'
import MessageSearch from '../components/MessageSearch'
import ReplyBox from '../components/ReplyBox'
import AIPanel from '../components/AIPanel'
import SummaryButton from '../components/SummaryButton'
import UpgradeProModal from '../components/UpgradeProModal'

export default function ChatRoom() {
  const channel = useCurrentChannel()
  const { user, token } = useAuth()
  const updateUser = useUpdateUser()
  const messages = useMessages()
  const loading = useChatLoading()
  const typingUsers = useTypingUsers()
  const onlineUsers = useOnlineUsers()
  const incomingCall = useIncomingCall()
  const callAccepted = useCallAccepted()
  const inCall = useInCall()
  const fetchMessages = useFetchMessages()
  const addMessage = useAddMessage()
  const updateMessage = useUpdateMessage()
  const removeMessage = useRemoveMessage()
  const setTyping = useSetTyping()
  const clearTypingStore = useClearTyping()
  const setOnlineUsers = useSetOnlineUsers()
  const clearChat = useClearChat()
  const isPro = useIsPro()
  const plan = usePlan()
  const fetchSubStatus = useSubscriptionStore((s) => s.fetchStatus)

  const [replyToId, replyToData] = useReplyToData()
  const setReplyTo = useMessageStore((s) => s.setReplyTo)
  const cancelReplyTo = useMessageStore((s) => s.cancelReplyTo)
  const clearSearch = useMessageStore((s) => s.clearSearch)
  const setThreadParentId = useMessageStore((s) => s.setThreadParentId)
  const setThreadReplies = useMessageStore((s) => s.setThreadReplies)
  const addThreadReply = useMessageStore((s) => s.addThreadReply)
  const clearThread = useMessageStore((s) => s.clearThread)
  const startEditing = useMessageStore((s) => s.startEditing)
  const cancelEditing = useMessageStore((s) => s.cancelEditing)
  const setEditingText = useMessageStore((s) => s.setEditingText)

  const [showSearch, setShowSearch] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const markSeenTimer = useRef(null)
  const seenMessageIds = useRef(new Set())

  const setIncomingCall = useCallStore((s) => s.setIncomingCall)
  const clearIncomingCall = useCallStore((s) => s.clearIncomingCall)
  const setCallAccepted = useCallStore((s) => s.setCallAccepted)
  const setCallType = useCallStore((s) => s.setCallType)
  const setLocalStream = useCallStore((s) => s.setLocalStream)
  const setRemoteStream = useCallStore((s) => s.setRemoteStream)
  const setInCall = useCallStore((s) => s.setInCall)
  const setPeerConnection = useCallStore((s) => s.setPeerConnection)
  const endCall = useCallStore((s) => s.endCall)

  const pcRef = useRef(null)
  const pendingCandidates = useRef([])
  const targetSocketRef = useRef(null)
  const [callType, setLocalCallType] = useState(null)

  useEffect(() => {
    const handler = () => setShowUpgradeModal(true)
    window.addEventListener('open-upgrade-modal', handler)
    return () => window.removeEventListener('open-upgrade-modal', handler)
  }, [])

  useEffect(() => {
    fetchSubStatus().then(() => {
      const { plan: p, subscriptionStatus: s } = useSubscriptionStore.getState()
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser.plan !== p || storedUser.subscriptionStatus !== s) {
        updateUser({ plan: p, subscriptionStatus: s })
      }
    })
  }, [fetchSubStatus, updateUser])

  const handleRemoteStream = useCallback(
    (stream) => {
      setRemoteStream(stream)
    },
    [setRemoteStream]
  )

  const markSeen = useCallback(() => {
    if (!channel?._id || !messages.length) return
    const unseenIds = messages
      .filter((m) => m.sender?._id !== user?._id && !m.deleted)
      .map((m) => m._id)
      .filter((id) => !seenMessageIds.current.has(id))

    if (!unseenIds.length) return

    unseenIds.forEach((id) => seenMessageIds.current.add(id))

    const socket = getSocket()
    if (socket?.connected) {
      socket.emit('mark-seen', { channelId: channel._id, messageIds: unseenIds })
    }
    messageApi.markSeen(channel._id, unseenIds).catch(() => {})
  }, [channel?._id, messages, user?._id])

  useEffect(() => {
    if (!channel?._id || !token) return

    clearChat()
    fetchMessages(channel._id)
    seenMessageIds.current = new Set()

    const socket = connectSocket(token)

    socket.on('new-message', (msg) => {
      if (msg.channel === channel._id || msg.channel?._id === channel._id) {
        addMessage(msg)
      }
    })

    socket.on('message-updated', (updated) => {
      if (updated.channel === channel._id || updated.channel?._id === channel._id) {
        updateMessage(updated)
      }
    })

    socket.on('message-deleted', ({ messageId, channelId }) => {
      if (channelId === channel._id) {
        removeMessage(messageId)
      }
    })

    socket.on('reply-message', ({ parentId: parentMsgId, reply }) => {
      if (reply.channel === channel._id || reply.channel?._id === channel._id) {
        const currentThreadId = useMessageStore.getState().threadParentId
        if (currentThreadId && currentThreadId === reply.replyTo) {
          addThreadReply(reply)
        }
      }
    })

    socket.on('messages-seen', ({ channelId, userId: seenUserId }) => {
      if (channelId === channel._id && seenUserId !== user?._id) {
        fetchMessages(channel._id)
      }
    })

    socket.on('typing', (data) => {
      if (data.user._id !== user?._id) {
        setTyping(data.channelId, data.user)
      }
    })

    socket.on('stop-typing', (data) => {
      clearTypingStore(data.channelId, data.userId)
    })

    socket.on('online-users', (users) => {
      setOnlineUsers(users)
    })

    socket.on('incoming-call', (data) => {
      if (data.from.userId !== user?._id) {
        setIncomingCall(data)
      }
    })

    socket.on('call-accepted', (data) => {
      const pc = pcRef.current
      if (pc && data.answer) {
        setRemoteDescription(pc, data.answer).then(() => {
          for (const c of pendingCandidates.current) {
            addIceCandidate(pc, c)
          }
          pendingCandidates.current = []
        })
      }
    })

    socket.on('ice-candidate', (data) => {
      const pc = pcRef.current
      if (pc?.remoteDescription) {
        addIceCandidate(pc, data.candidate)
      } else {
        pendingCandidates.current.push(data.candidate)
      }
    })

    socket.on('call-ended', () => {
      endCall()
      pcRef.current = null
      pendingCandidates.current = []
    })

    socket.on('screen-share-started', (data) => {
      useCallStore.getState().setRemoteScreenSharing(true)
    })

    socket.on('screen-share-stopped', () => {
      useCallStore.getState().setRemoteScreenSharing(false)
    })

    socket.on('connect', () => {
      socket.emit('join-channel', channel._id)
    })

    socket.emit('join-channel', channel._id)

    markSeenTimer.current = setInterval(markSeen, 3000)

    return () => {
      socket.emit('leave-channel', channel._id)
      socket.off('new-message')
      socket.off('message-updated')
      socket.off('message-deleted')
      socket.off('reply-message')
      socket.off('messages-seen')
      socket.off('typing')
      socket.off('stop-typing')
      socket.off('online-users')
      socket.off('incoming-call')
      socket.off('call-accepted')
      socket.off('ice-candidate')
      socket.off('call-ended')
      socket.off('screen-share-started')
      socket.off('screen-share-stopped')
      socket.off('connect')
      endCall()
      pcRef.current = null
      pendingCandidates.current = []
      clearThread()
      cancelReplyTo()
      clearSearch()
      if (markSeenTimer.current) clearInterval(markSeenTimer.current)
      seenMessageIds.current = new Set()
    }
  }, [channel?._id, token, user?._id])

  const startCall = useCallback(
    async (withVideo) => {
      useCallStore.getState().setCallEnded(false)
      const socket = getSocket()
      if (!socket || !channel?._id) return

      const stream = await getLocalStream(withVideo, true)
      if (!stream) return
      setLocalStream(stream)
      setCallType(withVideo ? 'video' : 'audio')
      setLocalCallType(withVideo ? 'video' : 'audio')

      const pc = createPeerConnection(handleRemoteStream)
      pcRef.current = pc
      setPeerConnection(pc)

      pc.onicecandidate = (e) => {
        if (e.candidate && targetSocketRef.current) {
          socket.emit('ice-candidate', {
            targetSocketId: targetSocketRef.current,
            candidate: e.candidate,
          })
        }
      }

      addLocalTracks(pc, stream)
      const offer = await createOffer(pc)

      const targetUser = onlineUsers.find((u) => u.userId !== user._id)
      if (!targetUser) return

      targetSocketRef.current = targetUser.socketId

      socket.emit('call-user', {
        targetUserId: targetUser.userId,
        offer,
        callType: withVideo ? 'video' : 'audio',
      })

      setInCall(true)
    },
    [channel?._id, user._id, onlineUsers, handleRemoteStream, setLocalStream, setPeerConnection, setInCall]
  )

  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return
    const socket = getSocket()
    if (!socket) return

    const stream = await getLocalStream(incomingCall.callType === 'video', true)
    if (!stream) return
    setLocalStream(stream)
    setCallType(incomingCall.callType)
    setLocalCallType(incomingCall.callType)

    const pc = createPeerConnection(handleRemoteStream)
    pcRef.current = pc
    setPeerConnection(pc)

    targetSocketRef.current = incomingCall.fromSocketId

    pc.onicecandidate = (e) => {
      if (e.candidate && targetSocketRef.current) {
        socket.emit('ice-candidate', {
          targetSocketId: targetSocketRef.current,
          candidate: e.candidate,
        })
      }
    }

    addLocalTracks(pc, stream)
    await setRemoteDescription(pc, incomingCall.offer)

    const answer = await createAnswer(pc)

    socket.emit('answer-call', {
      targetSocketId: targetSocketRef.current,
      answer,
    })

    for (const c of pendingCandidates.current) {
      addIceCandidate(pc, c)
    }
    pendingCandidates.current = []

    setInCall(true)
    clearIncomingCall()
  }, [incomingCall, handleRemoteStream, setLocalStream, setPeerConnection, setInCall, clearIncomingCall, setCallType])

  useEffect(() => {
    if (callAccepted && incomingCall) {
      acceptIncomingCall()
    }
  }, [callAccepted])

  const handleStartScreenShare = useCallback(async () => {
    const socket = getSocket()
    const pc = pcRef.current
    if (!socket || !pc) return

    try {
      const screenStream = await getScreenStream()

      const videoTrack = screenStream.getVideoTracks()[0]
      if (!videoTrack) return

      const replaced = replaceVideoTrack(pc, videoTrack)
      if (!replaced) return

      useCallStore.getState().setScreenStream(screenStream)
      useCallStore.getState().startScreenShare()

      socket.emit('screen-share-started', {
        targetSocketId: targetSocketRef.current,
      })

      videoTrack.onended = () => {
        handleStopScreenShare()
      }
    } catch (err) {
      if (err.message !== 'Screen sharing was cancelled') {
        console.error('Screen share error:', err.message)
      }
    }
  }, [])

  const handleStopScreenShare = useCallback(() => {
    const pc = pcRef.current
    const socket = getSocket()

    const localStream = useCallStore.getState().localStream
    const cameraTrack = localStream?.getVideoTracks()[0]

    if (pc && cameraTrack) {
      replaceVideoTrack(pc, cameraTrack)
    }

    stopScreenStream(useCallStore.getState().screenStream)
    useCallStore.getState().stopScreenShare()

    if (socket && targetSocketRef.current) {
      socket.emit('screen-share-stopped', {
        targetSocketId: targetSocketRef.current,
      })
    }
  }, [])

  const handleEndCall = useCallback(() => {
    const socket = getSocket()
    if (socket && targetSocketRef.current) {
      socket.emit('end-call', { targetSocketId: targetSocketRef.current })
    }
    endCall()
    pcRef.current = null
    pendingCandidates.current = []
    targetSocketRef.current = null
  }, [endCall])

  const handleReact = useCallback((messageId, type) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('react-message', { messageId, type }, (response) => {
      if (response?.success) {
        updateMessage(response.message)
      }
    })
  }, [updateMessage])

  const handleEdit = useCallback(async (msg) => {
    startEditing(msg)
  }, [startEditing])

  const handleEditSave = useCallback(async (messageId, text) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('edit-message', { messageId, text }, (response) => {
      if (response?.success) {
        updateMessage(response.message)
      }
      cancelEditing()
    })
  }, [updateMessage, cancelEditing])

  const handleDelete = useCallback((messageId) => {
    const socket = getSocket()
    if (!socket) return
    if (!window.confirm('Delete this message?')) return
    socket.emit('delete-message', { messageId }, (response) => {
      if (response?.success) {
        removeMessage(messageId)
      }
    })
  }, [removeMessage])

  const handleReply = useCallback((messageId) => {
    const msg = messages.find((m) => m._id === messageId)
    if (msg) setReplyTo(msg)
  }, [messages, setReplyTo])

  const handleSendReply = useCallback((messageId, text) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('reply-message', { messageId, text }, (response) => {
      if (response?.success) {
        addMessage(response.message)
        addThreadReply(response.message)
      }
      cancelReplyTo()
    })
  }, [addMessage, addThreadReply, cancelReplyTo])

  const handleOpenThread = useCallback(async (messageId) => {
    try {
      const { data } = await messageApi.getReplies(messageId)
      setThreadParentId(messageId)
      setThreadReplies(data.replies || [])
    } catch {
    }
  }, [setThreadParentId, setThreadReplies])

  const handleSend = useCallback(
    (text) => {
      const socket = getSocket()
      if (!socket?.connected || !channel?._id) {
        const token = useAuthStore.getState().token
        if (token) connectSocket(token)
        return
      }
      socket.emit('send-message', { channelId: channel._id, text })
    },
    [channel?._id]
  )

  const handleFileSent = useCallback(
    (fileData) => {
      const socket = getSocket()
      if (!socket?.connected || !channel?._id) {
        const token = useAuthStore.getState().token
        if (token) connectSocket(token)
        return
      }
      socket.emit('send-message', { channelId: channel._id, ...fileData })
    },
    [channel?._id]
  )

  const handleTyping = useCallback(() => {
    const socket = getSocket()
    if (!socket || !channel?._id) return
    socket.emit('typing', { channelId: channel._id })
  }, [channel?._id])

  const handleStopTyping = useCallback(() => {
    const socket = getSocket()
    if (!socket || !channel?._id) return
    socket.emit('stop-typing', { channelId: channel._id })
  }, [channel?._id])

  if (!channel) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', fontSize: 16, backgroundColor: '#fff' }}>
        Select a channel to start chatting
      </div>
    )
  }

  const channelTyping = typingUsers[channel._id] || {}
  const typingNames = Object.values(channelTyping).map((u) => u.name).join(', ')
  const onlineCount = onlineUsers.length
  const otherOnline = onlineUsers.filter((u) => u.userId !== user._id)

  const btnSec = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: 6,
    border: '1px solid #d0d7de', backgroundColor: '#fff',
    color: '#24292f', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', transition: 'border-color 0.15s, background-color 0.15s',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', position: 'relative' }}>
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #d0d7de', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            backgroundColor: '#f6f8fa', border: '1px solid #d0d7de',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#656d76', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.5 7.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0-6a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Z"/>
            </svg>
          </div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0d1117' }}>
            {channel.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
            {otherOnline.slice(0, 3).map((u) => (
              <div key={u.userId} title={u.name} style={{
                width: 22, height: 22, borderRadius: '50%',
                backgroundColor: '#0969da',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9, fontWeight: 600,
                border: '2px solid #fff',
                marginLeft: -6,
              }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: '#656d76' }}>
            {onlineCount} online
          </span>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            {plan !== 'pro' && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                style={{
                  ...btnSec, backgroundColor: '#f6f8fa', borderColor: '#d0d7de',
                  color: '#656d76', fontSize: 11,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
                </svg>
                Free
              </button>
            )}
            <SummaryButton
              channelId={channel._id}
              onSummaryComplete={() => setShowAIPanel(true)}
            />
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              style={{
                ...btnSec,
                backgroundColor: showAIPanel ? '#ddf4ff' : '#fff',
                borderColor: showAIPanel ? '#0969da' : '#d0d7de',
                color: showAIPanel ? '#0969da' : '#24292f',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.445Z"/>
              </svg>
              AI
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              style={btnSec}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z"/>
              </svg>
              Search
            </button>
            {otherOnline.length > 0 && !inCall && (
              <>
                <button
                  onClick={() => startCall(true)}
                  style={btnSec}
                  title="Video call"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1 3.25C1 1.784 2.784 0 4.25 0h7.5C13.216 0 15 1.784 15 3.25v9.5c0 1.466-1.784 2.75-3.25 2.75h-7.5C2.784 15.5 1 13.716 1 12.25Zm12.5 0c0-.69-.56-1.25-1.25-1.25h-7.5c-.69 0-1.25.56-1.25 1.25v9.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25Zm-1.873 3.56 2.25-1.5a.75.75 0 0 1 1.123.65v4.08a.75.75 0 0 1-1.123.65l-2.25-1.5a.75.75 0 0 1-.376-.65v-1.08a.75.75 0 0 1 .376-.65Z"/>
                  </svg>
                  Video
                </button>
                <button
                  onClick={() => startCall(false)}
                  style={btnSec}
                  title="Audio call"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3.326 2.484a.75.75 0 0 1 1.033.248c.382.599.946 1.394 1.711 2.324a.75.75 0 0 1-1.184.92c-.724-.88-1.248-1.614-1.606-2.16a.75.75 0 0 1 .246-1.032ZM12.674 2.484a.75.75 0 0 1 .246 1.032c-.358.546-.882 1.28-1.606 2.16a.75.75 0 1 1-1.184-.92c.765-.93 1.329-1.726 1.711-2.324a.75.75 0 0 1 1.033-.248ZM8 4a3 3 0 0 0-3 3v2a3 3 0 1 0 6 0V7a3 3 0 0 0-3-3Zm-4.5 3a4.5 4.5 0 1 1 9 0v2a4.5 4.5 0 0 1-9 0Z"/>
                  </svg>
                  Audio
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showSearch && (
        <MessageSearch
          channelId={channel._id}
          onSelectMessage={(messageId) => {
            const el = document.getElementById(`msg-${messageId}`)
            el?.scrollIntoView({ behavior: 'smooth' })
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MessageBox
            messages={messages}
            loading={loading}
            onReact={handleReact}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReply={handleReply}
            onOpenThread={handleOpenThread}
          />

          {typingNames && (
            <div style={{ padding: '4px 24px', fontSize: 12, color: '#656d76', fontStyle: 'italic' }}>
              {typingNames} typing...
            </div>
          )}

          <ReplyBox
            replyToData={replyToData}
            onCancelReply={cancelReplyTo}
            onSendReply={handleSendReply}
          />

          <div style={{ position: 'relative' }}>
            <MessageInput
              onSend={handleSend}
              onTyping={handleTyping}
              onStopTyping={handleStopTyping}
              fileUpload={
                <FileUpload onFileSent={handleFileSent} channelId={channel._id} />
              }
            />
          </div>
        </div>

        {showAIPanel && (
          <AIPanel
            channelId={channel._id}
            messages={messages}
            onClose={() => setShowAIPanel(false)}
          />
        )}
      </div>

      <IncomingCall />
      <VideoCall
        onEndCall={handleEndCall}
        onStartScreenShare={handleStartScreenShare}
        onStopScreenShare={handleStopScreenShare}
      />

      {showUpgradeModal && (
        <UpgradeProModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  )
}
