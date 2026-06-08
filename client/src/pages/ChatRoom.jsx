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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', position: 'relative' }}>
      <div style={{ padding: '16px 32px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#a0aec0', fontSize: 20 }}>#</span>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a202c' }}>
            {channel.name}
          </h2>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {plan !== 'pro' && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  backgroundColor: '#fefcbf', color: '#d69e2e', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Upgrade to Pro"
              >
                ★ Free Plan
              </button>
            )}
            <SummaryButton
              channelId={channel._id}
              onSummaryComplete={() => setShowAIPanel(true)}
            />
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
                backgroundColor: showAIPanel ? '#ebf8ff' : '#fff',
                color: showAIPanel ? '#2b6cb0' : '#4a5568',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
              title="AI Assistant"
            >
              {showAIPanel ? 'Close AI' : 'AI Chat'}
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
                backgroundColor: '#fff', color: '#4a5568', fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}
              title="Search messages"
            >
              {showSearch ? 'Close Search' : 'Search'}
            </button>
            {otherOnline.length > 0 && !inCall && (
              <>
                <button
                  onClick={() => startCall(true)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
                    backgroundColor: '#fff', color: '#4a5568', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  title="Start video call"
                >
                  Video
                </button>
                <button
                  onClick={() => startCall(false)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
                    backgroundColor: '#fff', color: '#4a5568', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  title="Start audio call"
                >
                  Audio
                </button>
              </>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {otherOnline.slice(0, 5).map((u) => (
                <span key={u.userId} title={u.name} style={{
                  width: 24, height: 24, borderRadius: '50%',
                  backgroundColor: '#3182ce', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600,
                }}>
                  {u.name.charAt(0).toUpperCase()}
                </span>
              ))}
              {otherOnline.length > 5 && (
                <span style={{ fontSize: 11, color: '#718096' }}>+{otherOnline.length - 5}</span>
              )}
            </div>
            <span style={{ fontSize: 12, color: '#718096' }}>
              {onlineCount} online
            </span>
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
            <div style={{ padding: '4px 32px', fontSize: 12, color: '#718096', fontStyle: 'italic' }}>
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
