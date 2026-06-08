import { useCallback, memo } from 'react'
import useCallStore from '../store/callStore'

function ScreenShareButton({ onStartScreenShare, onStopScreenShare }) {
  const isScreenSharing = useCallStore((s) => s.isScreenSharing)

  const handleClick = useCallback(() => {
    if (isScreenSharing) {
      onStopScreenShare?.()
    } else {
      onStartScreenShare?.()
    }
  }, [isScreenSharing, onStartScreenShare, onStopScreenShare])

  return (
    <button
      onClick={handleClick}
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        border: 'none',
        backgroundColor: isScreenSharing ? '#48bb78' : '#2d3748',
        color: '#fff',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1.2,
      }}
      title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
    >
      {isScreenSharing ? 'STOP' : 'SC'}
    </button>
  )
}

export default memo(ScreenShareButton)
