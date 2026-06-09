import { useCallback, memo } from 'react'
import useCallStore from '../store/callStore'

function ScreenShareButton({ onStartScreenShare, onStopScreenShare }) {
  const isScreenSharing = useCallStore((s) => s.isScreenSharing)

  const handleClick = useCallback(() => {
    isScreenSharing ? onStopScreenShare?.() : onStartScreenShare?.()
  }, [isScreenSharing, onStartScreenShare, onStopScreenShare])

  return (
    <button onClick={handleClick} style={{
      width: 44, height: 44, borderRadius: '50%', border: 'none',
      backgroundColor: isScreenSharing ? '#6366f1' : 'rgba(255,255,255,0.2)',
      color: '#fff', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background-color 0.15s',
    }}
      title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 576 512" fill="currentColor">
        <path d="M64 64C28.7 64 0 92.7 0 128l0 224c0 35.3 28.7 64 64 64l160 0 0 32-48 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l224 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-48 0 0-32 160 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L64 64z"/>
        {isScreenSharing && (
          <rect x="240" y="240" width="96" height="96" rx="8" fill="currentColor" opacity="0.0"/>
        )}
      </svg>
    </button>
  )
}

export default memo(ScreenShareButton)
