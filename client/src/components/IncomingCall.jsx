import { useCallback } from 'react'
import useCallStore from '../store/callStore'

export default function IncomingCall() {
  const incomingCall = useCallStore((s) => s.incomingCall)
  const clearIncomingCall = useCallStore((s) => s.clearIncomingCall)
  const setCallAccepted = useCallStore((s) => s.setCallAccepted)
  const setCallType = useCallStore((s) => s.setCallType)

  const answerCall = useCallback(() => {
    setCallAccepted(true); setCallType(incomingCall.callType)
  }, [incomingCall, setCallAccepted, setCallType])

  const rejectCall = useCallback(() => clearIncomingCall(), [clearIncomingCall])

  if (!incomingCall) return null

  const isVideo = incomingCall.callType === 'video'
  const initial = (incomingCall.from?.name?.charAt(0) || '?').toUpperCase()

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    }} onClick={(e) => e.target === e.currentTarget && rejectCall()}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, padding: 32,
        textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        maxWidth: 320, width: '90%',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 700, margin: '0 auto 12px',
        }}>
          {initial}
        </div>
        <h2 style={{ margin: '0 0 2px', color: '#111b21', fontSize: 18 }}>
          {incomingCall.from?.name || 'Someone'}
        </h2>
        <p style={{ margin: '0 0 20px', color: '#667781', fontSize: 13 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 640 512" fill="#667781" style={{ verticalAlign: 'middle', marginRight: 4 }}>
            {isVideo ? (
              <path d="M0 128C0 92.7 28.7 64 64 64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2l0 256c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.8-.7l-96-64L432 343.8l0-175.6 14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.8-.7z"/>
            ) : (
              <path d="M80 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96S80 43 80 96zM192 320l-48 0 0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96-16 0c-35.3 0-64-28.7-64-64l0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32c0 8.8 7.2 16 16 16l160 0c8.8 0 16-7.2 16-16l0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32c0 35.3-28.7 64-64 64l-16 0 0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96z"/>
            )}
          </svg>
          Incoming {incomingCall.callType} call...
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={rejectCall} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 24px', borderRadius: 8, border: 'none',
            backgroundColor: '#f0f2f5', color: '#111b21', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'background-color 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9edef'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 384 512" fill="currentColor">
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
            </svg>
            Decline
          </button>
          <button onClick={answerCall} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'opacity 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
              <path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/>
            </svg>
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
