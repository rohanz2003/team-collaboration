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
          backgroundColor: '#075E54', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 700, margin: '0 auto 12px',
        }}>
          {initial}
        </div>
        <h2 style={{ margin: '0 0 2px', color: '#111b21', fontSize: 18 }}>
          {incomingCall.from?.name || 'Someone'}
        </h2>
        <p style={{ margin: '0 0 20px', color: '#667781', fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#667781" style={{ verticalAlign: 'middle', marginRight: 4 }}>
            {isVideo ? (
              <path d="M1 3.25C1 1.784 2.784 0 4.25 0h7.5C13.216 0 15 1.784 15 3.25v9.5c0 1.466-1.784 2.75-3.25 2.75h-7.5C2.784 15.5 1 13.716 1 12.25Zm12.5 0c0-.69-.56-1.25-1.25-1.25h-7.5c-.69 0-1.25.56-1.25 1.25v9.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25Z"/>
            ) : (
              <path d="M3.326 2.484a.75.75 0 0 1 1.033.248c.382.599.946 1.394 1.711 2.324a.75.75 0 0 1-1.184.92c-.724-.88-1.248-1.614-1.606-2.16a.75.75 0 0 1 .246-1.032ZM12.674 2.484a.75.75 0 0 1 .246 1.032c-.358.546-.882 1.28-1.606 2.16a.75.75 0 1 1-1.184-.92c.765-.93 1.329-1.726 1.711-2.324a.75.75 0 0 1 1.033-.248ZM8 4a3 3 0 0 0-3 3v2a3 3 0 1 0 6 0V7a3 3 0 0 0-3-3Z"/>
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
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z"/>
            </svg>
            Decline
          </button>
          <button onClick={answerCall} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 24px', borderRadius: 8, border: 'none',
            backgroundColor: '#25D366', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'background-color 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#20BD5A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#25D366'}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.326 2.484a.75.75 0 0 1 1.033.248c.382.599.946 1.394 1.711 2.324a.75.75 0 0 1-1.184.92c-.724-.88-1.248-1.614-1.606-2.16a.75.75 0 0 1 .246-1.032ZM12.674 2.484a.75.75 0 0 1 .246 1.032c-.358.546-.882 1.28-1.606 2.16a.75.75 0 1 1-1.184-.92c.765-.93 1.329-1.726 1.711-2.324a.75.75 0 0 1 1.033-.248ZM8 6a3.5 3.5 0 0 0-3.5 3.5v.5h7v-.5A3.5 3.5 0 0 0 8 6Z"/>
            </svg>
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
