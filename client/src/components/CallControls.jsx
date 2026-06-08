import { memo } from 'react'
import useCallStore from '../store/callStore'

function CallControls({ onEndCall }) {
  const isMuted = useCallStore((s) => s.isMuted)
  const isCameraOff = useCallStore((s) => s.isCameraOff)
  const toggleMute = useCallStore((s) => s.toggleMute)
  const toggleCamera = useCallStore((s) => s.toggleCamera)

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        padding: '16px 0',
      }}
    >
      <button
        onClick={toggleMute}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isMuted ? '#e53e3e' : '#2d3748',
          color: '#fff',
          fontSize: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? 'M' : 'm'}
      </button>

      <button
        onClick={onEndCall}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#e53e3e',
          color: '#fff',
          fontSize: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="End call"
      >
        E
      </button>

      <button
        onClick={toggleCamera}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isCameraOff ? '#e53e3e' : '#2d3748',
          color: '#fff',
          fontSize: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {isCameraOff ? 'C' : 'c'}
      </button>
    </div>
  )
}

export default memo(CallControls)
