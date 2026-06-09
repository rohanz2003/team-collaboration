import { memo } from 'react'
import useCallStore from '../store/callStore'

function CallControls({ onEndCall }) {
  const isMuted = useCallStore((s) => s.isMuted)
  const isCameraOff = useCallStore((s) => s.isCameraOff)
  const toggleMute = useCallStore((s) => s.toggleMute)
  const toggleCamera = useCallStore((s) => s.toggleCamera)

  const btn = (danger, active) => ({
    width: 44, height: 44, borderRadius: '50%',
    border: 'none',
    backgroundColor: danger ? '#f85149' : active ? '#f85149' : 'rgba(255,255,255,0.2)',
    color: '#fff', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background-color 0.15s',
  })

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '12px 0' }}>
      <button onClick={toggleMute} style={btn(false, isMuted)}
        title={isMuted ? 'Unmute' : 'Mute'}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 384 512" fill="currentColor">
          {isMuted ? (
            <path d="M0 160l0 192c0 35.3 28.7 64 64 64l64 0 0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-64 64 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64L64 96C28.7 96 0 124.7 0 160zM336 256l48 0c0 70.7-57.3 128-128 128l0-96 80 0zM48 160c0-8.8 7.2-16 16-16l32 0 0 144-48 0 0-128zM336 128l0 112-80 0 0-160 64 0c8.8 0 16 7.2 16 16z"/>
          ) : (
            <path d="M80 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96S80 43 80 96zM192 320l-48 0 0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96-16 0c-35.3 0-64-28.7-64-64l0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32c0 8.8 7.2 16 16 16l160 0c8.8 0 16-7.2 16-16l0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32c0 35.3-28.7 64-64 64l-16 0 0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96z"/>
          )}
        </svg>
      </button>
      <button onClick={onEndCall} style={btn(true)}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a0111f'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f85149'}
        title="End call">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
          <path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/>
        </svg>
      </button>
      <button onClick={toggleCamera} style={btn(false, isCameraOff)}
        title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 576 512" fill="currentColor">
          {isCameraOff ? (
            <path d="M64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 64zm512 64c0-10.7-5.3-20.7-14.2-26.6L512 128l0 256 49.8-37.4c8.9-5.9 14.2-15.9 14.2-26.6l0-192z"/>
          ) : (
            <path d="M0 128C0 92.7 28.7 64 64 64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2l0 256c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.8-.7l-96-64L416 343.8l0-175.6 14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.8-.7z"/>
          )}
        </svg>
      </button>
    </div>
  )
}

export default memo(CallControls)
