import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocalStream, useRemoteStream, useCallType, useInCall, useCallEnded, useIsScreenSharing, useScreenStream, useRemoteScreenSharing } from '../store/callStore'
import CallControls from './CallControls'
import ScreenShareButton from './ScreenShareButton'

export default function VideoCall({ onEndCall, onStartScreenShare, onStopScreenShare }) {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const containerRef = useRef(null)
  const localStream = useLocalStream()
  const remoteStream = useRemoteStream()
  const callType = useCallType()
  const inCall = useInCall()
  const callEnded = useCallEnded()
  const isScreenSharing = useIsScreenSharing()
  const screenStream = useScreenStream()
  const remoteScreenSharing = useRemoteScreenSharing()
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (localVideoRef.current) {
      if (isScreenSharing && screenStream) localVideoRef.current.srcObject = screenStream
      else if (localStream) localVideoRef.current.srcObject = localStream
    }
  }, [isScreenSharing, screenStream, localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream
  }, [remoteStream])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  if (!inCall || callEnded) return null

  const isVideo = callType === 'video'

  return (
    <div ref={containerRef} style={{
      position: 'fixed', bottom: 80, right: 32,
      width: isFullscreen ? '100vw' : 360,
      height: isFullscreen ? '100vh' : 'auto',
      backgroundColor: '#1a1a2e', borderRadius: isFullscreen ? 0 : 12,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 1500,
      border: isFullscreen ? 'none' : '1px solid #6366f1',
      maxWidth: '100vw', maxHeight: '100vh',
      inset: isFullscreen ? 0 : 'auto',
    }}>
      <div style={{
        position: 'relative', backgroundColor: '#000',
        height: isFullscreen ? 'calc(100vh - 60px)' : 240,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {remoteScreenSharing && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            padding: '4px 10px', borderRadius: 6,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontSize: 11, fontWeight: 600, zIndex: 10,
          }}>
            Screen shared
          </div>
        )}
        {isVideo && remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', backgroundColor: '#000' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#8696a0', fontSize: 13,
          }}>
            {isVideo ? 'Waiting for video...' : 'Audio call'}
          </div>
        )}
        {isVideo && (
          <video ref={localVideoRef} autoPlay playsInline muted
            style={{
              position: 'absolute', bottom: 8, right: 8,
              width: isFullscreen ? 160 : 120,
              height: isFullscreen ? 120 : 90,
              borderRadius: 8, objectFit: 'cover',
              backgroundColor: '#21262d',
              transform: isScreenSharing ? 'none' : 'scaleX(-1)',
              border: '2px solid #6366f1',
            }}
          />
        )}
        {isScreenSharing && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            padding: '4px 10px', borderRadius: 6,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontSize: 11, fontWeight: 600, zIndex: 10,
          }}>
            Sharing screen
          </div>
        )}
        <button onClick={toggleFullscreen}
          style={{
            position: 'absolute', top: 8, right: isScreenSharing ? 110 : 8,
            border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff',
            cursor: 'pointer', borderRadius: 6,
            padding: '4px 8px', fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" fill="currentColor">
            {isFullscreen ? (
              <path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96zm0 320c0-17.7-14.3-32-32-32l-96 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96zM320 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM288 448c17.7 0 32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32z"/>
            ) : (
              <path d="M32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zm352-64c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0zm-224 0c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0zm0-128c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0z"/>
            )}
          </svg>
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>
      <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '8px 0' }}>
          <CallControls onEndCall={onEndCall} />
          <ScreenShareButton onStartScreenShare={onStartScreenShare} onStopScreenShare={onStopScreenShare} />
        </div>
      </div>
    </div>
  )
}
