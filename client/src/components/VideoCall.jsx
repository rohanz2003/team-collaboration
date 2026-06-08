import { useEffect, useRef } from 'react'
import { useLocalStream, useRemoteStream, useCallType, useInCall, useCallEnded, useIsScreenSharing, useScreenStream, useRemoteScreenSharing } from '../store/callStore'
import CallControls from './CallControls'
import ScreenShareButton from './ScreenShareButton'

export default function VideoCall({ onEndCall, onStartScreenShare, onStopScreenShare }) {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const localStream = useLocalStream()
  const remoteStream = useRemoteStream()
  const callType = useCallType()
  const inCall = useInCall()
  const callEnded = useCallEnded()
  const isScreenSharing = useIsScreenSharing()
  const screenStream = useScreenStream()
  const remoteScreenSharing = useRemoteScreenSharing()

  useEffect(() => {
    if (localVideoRef.current) {
      if (isScreenSharing && screenStream) {
        localVideoRef.current.srcObject = screenStream
      } else if (localStream) {
        localVideoRef.current.srcObject = localStream
      }
    }
  }, [isScreenSharing, screenStream, localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  if (!inCall || callEnded) return null

  const isVideo = callType === 'video'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        right: 32,
        width: 360,
        backgroundColor: '#1a202c',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        zIndex: 1500,
      }}
    >
      <div style={{ position: 'relative', backgroundColor: '#000', height: 240 }}>
        {remoteScreenSharing && (
          <div
            style={{
              position: 'absolute', top: 8, left: 8, zIndex: 10,
              padding: '4px 10px', borderRadius: 4, backgroundColor: '#48bb78',
              color: '#fff', fontSize: 11, fontWeight: 600,
            }}
          >
            Screen shared
          </div>
        )}
        {isVideo && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%', height: '100%', objectFit: 'contain',
              display: 'block', backgroundColor: '#000',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#718096', fontSize: 14,
            }}
          >
            {isVideo ? 'Waiting for video...' : 'Audio call'}
          </div>
        )}
        {isVideo && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute', bottom: 8, right: 8,
              width: 120, height: 90, borderRadius: 8,
              objectFit: 'cover', backgroundColor: '#2d3748',
              transform: isScreenSharing ? 'none' : 'scaleX(-1)',
            }}
          />
        )}
        {isScreenSharing && (
          <div
            style={{
              position: 'absolute', top: 32, left: 8, zIndex: 10,
              padding: '4px 10px', borderRadius: 4, backgroundColor: '#3182ce',
              color: '#fff', fontSize: 11, fontWeight: 600,
            }}
          >
            You are sharing screen
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px 0' }}>
        <CallControls onEndCall={onEndCall} />
        <ScreenShareButton
          onStartScreenShare={onStartScreenShare}
          onStopScreenShare={onStopScreenShare}
        />
      </div>
    </div>
  )
}
