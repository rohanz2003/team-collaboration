import { useCallback } from 'react'
import useCallStore from '../store/callStore'

export default function IncomingCall() {
  const incomingCall = useCallStore((s) => s.incomingCall)
  const clearIncomingCall = useCallStore((s) => s.clearIncomingCall)
  const setCallAccepted = useCallStore((s) => s.setCallAccepted)
  const setCallType = useCallStore((s) => s.setCallType)

  const answerCall = useCallback(() => {
    setCallAccepted(true)
    setCallType(incomingCall.callType)
  }, [incomingCall, setCallAccepted, setCallType])

  const rejectCall = useCallback(() => {
    clearIncomingCall()
  }, [clearIncomingCall])

  if (!incomingCall) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          maxWidth: 360,
          width: '90%',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#3182ce',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 700,
            margin: '0 auto 16px',
          }}
        >
          {incomingCall.from?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <h2 style={{ margin: '0 0 4px', color: '#1a202c', fontSize: 20 }}>
          {incomingCall.from?.name || 'Someone'}
        </h2>
        <p style={{ margin: '0 0 24px', color: '#718096', fontSize: 14 }}>
          Incoming {incomingCall.callType} call...
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button
            onClick={rejectCall}
            style={{
              padding: '12px 32px',
              borderRadius: 30,
              border: 'none',
              backgroundColor: '#e53e3e',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reject
          </button>
          <button
            onClick={answerCall}
            style={{
              padding: '12px 32px',
              borderRadius: 30,
              border: 'none',
              backgroundColor: '#48bb78',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
