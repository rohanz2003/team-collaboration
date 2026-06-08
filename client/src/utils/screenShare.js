export async function getScreenStream() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    })
    return stream
  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
      throw new Error('Screen sharing was cancelled')
    }
    throw err
  }
}

export function stopScreenStream(stream) {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
  }
}

export function replaceVideoTrack(pc, newTrack) {
  if (!pc) return false
  const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
  if (sender) {
    sender.replaceTrack(newTrack)
    return true
  }
  return false
}

export function replaceAudioTrack(pc, newTrack) {
  if (!pc) return false
  const sender = pc.getSenders().find((s) => s.track?.kind === 'audio')
  if (sender) {
    sender.replaceTrack(newTrack)
    return true
  }
  return false
}

export function getCameraStream(stream) {
  return stream?.getVideoTracks().find((t) => t.kind === 'video') || null
}
