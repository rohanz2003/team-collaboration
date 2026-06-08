const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export async function getLocalStream(video = true, audio = true) {
  try {
    return await navigator.mediaDevices.getUserMedia({ video, audio })
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Camera/microphone permission denied')
    }
    if (err.name === 'NotFoundError') {
      throw new Error('No camera or microphone found')
    }
    throw err
  }
}

export function createPeerConnection(remoteStreamCallback) {
  const pc = new RTCPeerConnection(RTC_CONFIG)

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      return e.candidate
    }
    return null
  }

  pc.ontrack = (e) => {
    if (e.streams?.[0]) {
      remoteStreamCallback(e.streams[0])
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
  await pc.setRemoteDescription(new RTCSessionDescription(description))
}

export function addIceCandidate(pc, candidate) {
  if (candidate) {
    pc.addIceCandidate(new RTCIceCandidate(candidate))
  }
}

export function addLocalTracks(pc, stream) {
  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream)
  })
}
