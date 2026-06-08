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
      if (isScreenSharing && screenStream) localVideoRef.current.srcObject = screenStream
      else if (localStream) localVideoRef.current.srcObject = localStream
    }
  }, [isScreenSharing, screenStream, localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream
  }, [remoteStream])

  if (!inCall || callEnded) return null

  const isVideo = callType === 'video'

  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 32, width: 360,
      backgroundColor: '#075E54', borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 1500,
      border: '1px solid #128C7E',
    }}>
      <div style={{ position: 'relative', backgroundColor: '#000', height: 240 }}>
        {remoteScreenSharing && (
          <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 8px', borderRadius: 4, backgroundColor: '#25D366', color: '#fff', fontSize: 10, fontWeight: 600, zIndex: 10 }}>
            Screen shared
          </div>
        )}
        {isVideo && remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', backgroundColor: '#000' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8696a0', fontSize: 13 }}>
            {isVideo ? 'Waiting for video...' : 'Audio call'}
          </div>
        )}
        {isVideo && (
          <video ref={localVideoRef} autoPlay playsInline muted style={{
            position: 'absolute', bottom: 8, right: 8,
            width: 120, height: 90, borderRadius: 6, objectFit: 'cover',
            backgroundColor: '#21262d', transform: isScreenSharing ? 'none' : 'scaleX(-1)',
            border: '2px solid #25D366',
          }} />
        )}
        {isScreenSharing && (
          <div style={{ position: 'absolute', top: 32, left: 8, padding: '3px 8px', borderRadius: 4, backgroundColor: '#075E54', color: '#fff', fontSize: 10, fontWeight: 600, zIndex: 10 }}>
            You are sharing screen
          </div>
        )}
      </div>
      <div style={{ backgroundColor: '#075E54' }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '8px 0' }}>
          <CallControls onEndCall={onEndCall} />
          <ScreenShareButton onStartScreenShare={onStartScreenShare} onStopScreenShare={onStopScreenShare} />
        </div>
      </div>
    </div>
  )
}
