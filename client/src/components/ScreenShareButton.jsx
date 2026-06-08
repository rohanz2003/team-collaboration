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
      backgroundColor: isScreenSharing ? '#25D366' : 'rgba(255,255,255,0.2)',
      color: '#fff', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background-color 0.15s',
    }}
      title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 14.25 12H9.06l.22 1.5h2.22a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1 0-1.5h2.22l.22-1.5H1.75A1.75 1.75 0 0 1 0 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
      </svg>
    </button>
  )
}

export default memo(ScreenShareButton)
