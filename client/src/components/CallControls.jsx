import { memo } from 'react'
import useCallStore from '../store/callStore'

function CallControls({ onEndCall }) {
  const isMuted = useCallStore((s) => s.isMuted)
  const isCameraOff = useCallStore((s) => s.isCameraOff)
  const toggleMute = useCallStore((s) => s.toggleMute)
  const toggleCamera = useCallStore((s) => s.toggleCamera)

  const btnBase = (active, danger, bgActive) => ({
    width: 48, height: 48, borderRadius: '50%',
    border: 'none',
    backgroundColor: danger ? '#cf222e' : active ? '#cf222e' : bgActive || '#21262d',
    color: '#fff',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background-color 0.15s, transform 0.1s',
  })

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '12px 0' }}>
      <button
        onClick={toggleMute}
        style={btnBase(isMuted, false, '#21262d')}
        onMouseEnter={(e) => { if (!isMuted) e.currentTarget.style.backgroundColor = '#30363d' }}
        onMouseLeave={(e) => { if (!isMuted) e.currentTarget.style.backgroundColor = '#21262d' }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5h-.5l-.721 9.673A1.75 1.75 0 0 1 10.282 16H5.718a1.75 1.75 0 0 1-1.747-1.827L3.25 4.5h-.5a.75.75 0 0 1 0-1.5H5V1.75A1.75 1.75 0 0 1 6.75 0h2.5A1.75 1.75 0 0 1 11 1.75ZM5.75 6.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.326 2.484a.75.75 0 0 1 1.033.248c.382.599.946 1.394 1.711 2.324a.75.75 0 0 1-1.184.92c-.724-.88-1.248-1.614-1.606-2.16a.75.75 0 0 1 .246-1.032ZM12.674 2.484a.75.75 0 0 1 .246 1.032c-.358.546-.882 1.28-1.606 2.16a.75.75 0 1 1-1.184-.92c.765-.93 1.329-1.726 1.711-2.324a.75.75 0 0 1 1.033-.248ZM8 4a3 3 0 0 0-3 3v2a3 3 0 1 0 6 0V7a3 3 0 0 0-3-3Zm-4.5 3a4.5 4.5 0 1 1 9 0v2a4.5 4.5 0 0 1-9 0Z"/>
          </svg>
        )}
      </button>

      <button
        onClick={onEndCall}
        style={btnBase(true, true)}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a0111f'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#cf222e'}
        title="End call"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.326 2.484a.75.75 0 0 1 1.033.248c.382.599.946 1.394 1.711 2.324a.75.75 0 0 1-1.184.92c-.724-.88-1.248-1.614-1.606-2.16a.75.75 0 0 1 .246-1.032ZM12.674 2.484a.75.75 0 0 1 .246 1.032c-.358.546-.882 1.28-1.606 2.16a.75.75 0 1 1-1.184-.92c.765-.93 1.329-1.726 1.711-2.324a.75.75 0 0 1 1.033-.248ZM8 6a3.5 3.5 0 0 0-3.5 3.5v.5h7v-.5A3.5 3.5 0 0 0 8 6Z"/>
        </svg>
      </button>

      <button
        onClick={toggleCamera}
        style={btnBase(isCameraOff, false, '#21262d')}
        onMouseEnter={(e) => { if (!isCameraOff) e.currentTarget.style.backgroundColor = '#30363d' }}
        onMouseLeave={(e) => { if (!isCameraOff) e.currentTarget.style.backgroundColor = '#21262d' }}
        title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {isCameraOff ? (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 3.25C1 1.784 2.784 0 4.25 0h7.5C13.216 0 15 1.784 15 3.25v9.5c0 1.466-1.784 2.75-3.25 2.75h-7.5C2.784 15.5 1 13.716 1 12.25Zm12.5 0c0-.69-.56-1.25-1.25-1.25h-7.5c-.69 0-1.25.56-1.25 1.25v9.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25Zm-1.873 3.56 2.25-1.5a.75.75 0 0 1 1.123.65v4.08a.75.75 0 0 1-1.123.65l-2.25-1.5a.75.75 0 0 1-.376-.65v-1.08a.75.75 0 0 1 .376-.65Z"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 3.25C1 1.784 2.784 0 4.25 0h7.5C13.216 0 15 1.784 15 3.25v9.5c0 1.466-1.784 2.75-3.25 2.75h-7.5C2.784 15.5 1 13.716 1 12.25Zm12.5 0c0-.69-.56-1.25-1.25-1.25h-7.5c-.69 0-1.25.56-1.25 1.25v9.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25Zm-1.873 3.56 2.25-1.5a.75.75 0 0 1 1.123.65v4.08a.75.75 0 0 1-1.123.65l-2.25-1.5a.75.75 0 0 1-.376-.65v-1.08a.75.75 0 0 1 .376-.65Z"/>
          </svg>
        )}
      </button>
    </div>
  )
}

export default memo(CallControls)
