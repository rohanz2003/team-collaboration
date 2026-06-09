import { useEffect, useCallback, useRef, useState } from 'react'
import { useCurrentChannel, useCurrentWorkspace } from '../store/workspaceStore'
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
import { getScreenStream, renegotiateVideoTrack, stopScreenStream } from '../utils/screenShare'
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
  const workspace = useCurrentWorkspace()
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

      try {
        const stream = await getLocalStream(withVideo, true)
        setLocalStream(stream)
        setCallType(withVideo ? 'video' : 'audio')
        setLocalCallType(withVideo ? 'video' : 'audio')

        const pc = createPeerConnection(handleRemoteStream, (state) => {
          if (state === 'failed' || state === 'disconnected') {
            handleEndCall()
          }
        })
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

        const memberIds = new Set(
          (workspace?.members || []).map((m) =>
            typeof m.user === 'object' ? m.user?._id : m.user
          ).filter(Boolean)
        )
        const targetUser = onlineUsers.find((u) =>
          u.userId !== user._id && memberIds.has(u.userId)
        )
        if (!targetUser) {
          alert('No online members found in this workspace')
          return
        }

        targetSocketRef.current = targetUser.socketId

        addLocalTracks(pc, stream)
        const offer = await createOffer(pc)

        socket.emit('call-user', {
          targetUserId: targetUser.userId,
          offer,
          callType: withVideo ? 'video' : 'audio',
        })

        setInCall(true)
      } catch (err) {
        alert(err.message || 'Failed to start call')
      }
    },
    [channel?._id, workspace?.members, user._id, onlineUsers, handleRemoteStream, setLocalStream, setPeerConnection, setInCall, handleEndCall]
  )

  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return
    const socket = getSocket()
    if (!socket) return

    try {
      const stream = await getLocalStream(incomingCall.callType === 'video', true)
      setLocalStream(stream)
      setCallType(incomingCall.callType)
      setLocalCallType(incomingCall.callType)

      const pc = createPeerConnection(handleRemoteStream, (state) => {
        if (state === 'failed' || state === 'disconnected') {
          handleEndCall()
        }
      })
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
    } catch (err) {
      alert('Failed to accept call: ' + (err.message || 'Unknown error'))
    }
  }, [incomingCall, handleRemoteStream, setLocalStream, setPeerConnection, setInCall, clearIncomingCall, setCallType, handleEndCall])

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

      const result = await renegotiateVideoTrack(pc, videoTrack, screenStream)
      if (!result) return

      useCallStore.getState().setScreenStream(screenStream)
      useCallStore.getState().startScreenShare()

      if (result && typeof result !== 'boolean') {
        socket.emit('ice-candidate', {
          targetSocketId: targetSocketRef.current,
          candidate: { sdp: result.sdp, type: result.type },
        })
      }

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
  }, [handleStopScreenShare])

  const handleStopScreenShare = useCallback(() => {
    const pc = pcRef.current
    const socket = getSocket()

    const localStream = useCallStore.getState().localStream
    const cameraTrack = localStream?.getVideoTracks()[0]

    if (pc && cameraTrack) {
      renegotiateVideoTrack(pc, cameraTrack, localStream).then(() => {})
    }

    stopScreenStream(useCallStore.getState().screenStream)
    useCallStore.getState().stopScreenShare()

    if (socket && targetSocketRef.current) {
      socket.emit('screen-share-stopped', {
        targetSocketId: targetSocketRef.current,
      })
    }
  }, [handleStopScreenShare])

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
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8696a0', fontSize: 15, background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f0ff 100%)' }}>
        Select a channel to start chatting
      </div>
    )
  }

  const channelTyping = typingUsers[channel._id] || {}
  const typingNames = Object.values(channelTyping).map((u) => u.name).join(', ')
  const onlineCount = onlineUsers.length
  const otherOnline = onlineUsers.filter((u) => u.userId !== user._id)

  const PRIMARY = '#6366f1'
  const GRADIENT = 'linear-gradient(135deg, #6366f1, #8b5cf6)'

  const iconBtn = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.2)', border: 'none',
    color: '#fff', cursor: 'pointer', padding: '6px',
    borderRadius: '50%', transition: 'background-color 0.15s',
    width: 34, height: 34,
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f0ff 100%)', position: 'relative' }}>
      <div style={{ padding: '8px 16px', background: GRADIENT, minHeight: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: '100%' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0, fontSize: 14, fontWeight: 600,
          }}>
            #
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
              {channel.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              {onlineCount > 0 ? `${otherOnline.length > 0 ? otherOnline.map(u => u.name).join(', ') : 'online'}` : 'offline'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {plan !== 'pro' && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                style={{
                  ...iconBtn, borderRadius: 6, padding: '4px 8px', width: 'auto',
                  fontSize: 11, fontWeight: 600, gap: 3,
                }}
                title="Upgrade"
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
                ...iconBtn,
                backgroundColor: showAIPanel ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
              }}
              title="AI"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 640 512" fill="currentColor">
                <path d="M86.3 197.8c-8-.1-15.9 1.7-23.1 5.1s-13.5 8.6-18.4 14.9l0-61.9c0-2.2-.9-4.3-2.4-5.8s-3.6-2.4-5.8-2.4l-28.4 0c-2.2 0-4.3 .9-5.8 2.4S0 153.8 0 156L0 333.6c0 1.1 .2 2.1 .6 3.1s1 1.9 1.8 2.7 1.7 1.4 2.7 1.8 2.1 .6 3.1 .6l28.4 0c1.1 0 2.1-.2 3.1-.6s1.9-1 2.7-1.8 1.4-1.7 1.8-2.7 .6-2.1 .6-3.1l0-8.1c11.6 13.4 25.9 19.8 41.6 19.8 34.6 0 61.9-26.2 61.9-73.8 0-45.9-27-73.6-61.9-73.6zM71.5 305.7c-9.6 0-21.2-4.9-26.7-12.5l0-43c5.5-7.6 17.2-12.8 26.7-12.8 17.7 0 31.1 13.1 31.1 34 0 21.2-13.4 34.3-31.1 34.3zm156.4-59a17.4 17.4 0 1 0 0 34.8 17.4 17.4 0 1 0 0-34.8zm46.1-90l0-44.7c2.8-1.2 5.2-3.3 6.6-6s1.9-5.8 1.3-8.9-2.2-5.7-4.6-7.7-5.4-3-8.4-3-6.1 1.1-8.4 3-4 4.7-4.6 7.7-.1 6.1 1.3 8.9 3.8 4.8 6.6 6l0 44.7c-28 1.3-54.4 13.6-73.6 34.1s-29.5 47.7-28.8 75.8 12.3 54.7 32.4 74.3 47 30.6 75.1 30.6 55-11 75.1-30.6 31.7-46.3 32.4-74.3-9.7-55.3-28.8-75.8-45.5-32.8-73.6-34.1zm86 107.4c0 30.5-40.8 55.3-91.1 55.3s-91.1-24.7-91.1-55.3 40.8-55.3 91.1-55.3 91.1 24.7 91.1 55.3l0 0zm-50.2 17.4c3.4 0 6.8-1 9.7-2.9s5.1-4.6 6.4-7.8 1.7-6.7 1-10.1-2.3-6.5-4.8-8.9-5.5-4.1-8.9-4.8-6.9-.3-10.1 1-5.9 3.5-7.8 6.4-2.9 6.2-2.9 9.7c0 4.6 1.8 9 5.1 12.3s7.7 5.1 12.3 5.1l0 0zm270.9-31c-14.8-2.6-22.4-3.8-22.4-9.9 0-5.5 7.3-9.9 17.7-9.9 12.2 .1 24.2 3.6 34.5 10.1 1.8 1.2 4 1.6 6.2 1.1s4-1.7 5.1-3.6c.1-.1 .1-.2 .2-.3l8.6-14.9c1.1-1.9 1.4-4.1 .8-6.1s-1.9-3.9-3.7-5c-15.7-9.4-33.7-14.3-52-14.1-39 0-60.2 21.5-60.2 46.2 0 36.3 33.7 41.9 57.6 45.6 13.4 2.3 24.1 4.4 24.1 11 0 6.4-5.5 10.8-18.9 10.8-13.6 0-31-6.2-42.6-13.6-.9-.6-1.9-1-3-1.2s-2.1-.2-3.2 .1-2.1 .7-2.9 1.3-1.6 1.4-2.2 2.3c0 .1-.1 .1-.1 .2l-10.2 16.9c-1.1 1.8-1.4 4-1 6s1.7 3.9 3.5 5c15.2 10.3 37.7 16.7 59.4 16.7 40.4 0 64-19.8 64-46.5 0-38.1-35.5-43.9-59.3-48.3zm-95.9 60.8c-.5-2-1.8-3.7-3.6-4.8s-3.9-1.5-5.9-1.1c-1.4 .3-2.8 .4-4.2 .4-7.8 0-12.5-6.1-12.5-14.2l0-51.2 20.3 0c2.2 0 4.2-.9 5.8-2.4s2.4-3.6 2.4-5.8l0-22.7c0-2.2-.9-4.2-2.4-5.8s-3.6-2.4-5.8-2.4l-20.3 0 0-30.2c0-2.2-.9-4.2-2.4-5.8s-3.6-2.4-5.8-2.4l-28.2 0c-2.2 0-4.2 .9-5.8 2.4s-2.4 3.6-2.4 5.8l0 30.2-15.1 0c-1.1 0-2.1 .2-3.1 .6s-1.9 1-2.6 1.8-1.4 1.7-1.8 2.6-.6 2-.6 3.1l0 22.7c0 1.1 .2 2.1 .6 3.1s1 1.9 1.8 2.6 1.7 1.4 2.6 1.8 2 .6 3.1 .6l15.1 0 0 63.7c0 27 15.4 41.3 43.9 41.3 12.2 0 21.4-2.2 27.6-5.4 1.6-.8 2.9-2.2 3.7-3.9s.9-3.6 .5-5.4l-5-19.3z"/>
              </svg>
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              style={iconBtn}
              title="Search"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z"/>
              </svg>
            </button>
            {otherOnline.length > 0 && !inCall && (
              <>
                <button
                  onClick={() => startCall(true)}
                  style={iconBtn}
                  title="Video call"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M0 4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v.5l2.328-1.164A.5.5 0 0 1 14 3.82v8.36a.5.5 0 0 1-.672.484L11 11.5V12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Z"/>
                  </svg>
                </button>
                <button
                  onClick={() => startCall(false)}
                  style={iconBtn}
                  title="Audio call"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328Z"/>
                  </svg>
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
            <div style={{ padding: '6px 24px', fontSize: 12, color: '#667781', fontStyle: 'italic' }}>
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
            workspaceId={workspace?._id}
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
