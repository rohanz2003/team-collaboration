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

export async function replaceVideoTrack(pc, newTrack) {
  if (!pc) return false
  const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
  if (sender) {
    try {
      await sender.replaceTrack(newTrack)
      return true
    } catch {
      return false
    }
  }
  return false
}

export async function renegotiateVideoTrack(pc, newTrack, originalStream) {
  if (!pc) return false
  const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
  if (!sender) return false
  try {
    await sender.replaceTrack(newTrack)
    return true
  } catch {
    try {
      pc.removeTrack(sender)
      pc.addTrack(newTrack, originalStream)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      return offer
    } catch {
      return false
    }
  }
}
