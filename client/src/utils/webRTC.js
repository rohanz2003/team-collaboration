const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}

export async function getLocalStream(video = true, audio = true) {
  try {
    const constraints = { audio: true }
    if (video) {
      constraints.video = {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
      }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    return stream
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Camera/microphone permission denied. Please allow access in your browser settings.')
    }
    if (err.name === 'NotFoundError') {
      throw new Error('No camera or microphone found')
    }
    if (err.name === 'NotReadableError') {
      throw new Error('Camera/microphone is already in use by another app')
    }
    throw err
  }
}

export function createPeerConnection(remoteStreamCallback, iceStateCallback) {
  const pc = new RTCPeerConnection(RTC_CONFIG)
  const remoteStream = new MediaStream()

  pc.ontrack = (e) => {
    if (e.track) {
      remoteStream.addTrack(e.track)
    }
    if (remoteStream.getTracks().length > 0) {
      remoteStreamCallback(remoteStream)
    }
  }

  if (iceStateCallback) {
    pc.oniceconnectionstatechange = () => {
      iceStateCallback(pc.iceConnectionState)
    }
    pc.onconnectionstatechange = () => {
      iceStateCallback(pc.connectionState)
    }
  }

  return pc
}

export async function createOffer(pc) {
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  return offer
}

export async function createAnswer(pc) {
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  return answer
}

export async function setRemoteDescription(pc, description) {
  const desc = new RTCSessionDescription(description)
  await pc.setRemoteDescription(desc)
}

export function addIceCandidate(pc, candidate) {
  if (candidate) {
    pc.addIceCandidate(new RTCIceCandidate(candidate))
  }
}

export function addLocalTracks(pc, stream) {
  stream.getTracks().forEach((track) => {
    if (track.kind === 'video' || track.kind === 'audio') {
      pc.addTrack(track, stream)
    }
  })
}

export function removeLocalTracks(pc) {
  pc.getSenders().forEach((sender) => {
    if (sender.track) {
      sender.track.stop()
      pc.removeTrack(sender)
    }
  })
}
