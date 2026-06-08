import { create } from 'zustand'

const useCallStore = create((set) => ({
  incomingCall: null,
  callAccepted: false,
  callEnded: false,
  inCall: false,
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isCameraOff: false,
  callType: null,
  peerConnection: null,
  isScreenSharing: false,
  screenStream: null,
  activeVideoTrackType: 'camera',
  remoteScreenSharing: false,

  setIncomingCall: (call) => set({ incomingCall: call }),
  clearIncomingCall: () => set({ incomingCall: null }),

  setCallAccepted: (val) => set({ callAccepted: val }),
  setCallEnded: (val) => set({ callEnded: val }),
  setInCall: (val) => set({ inCall: val }),
  setCallType: (type) => set({ callType: type }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setIsMuted: (val) => set({ isMuted: val }),
  setIsCameraOff: (val) => set({ isCameraOff: val }),
  setPeerConnection: (pc) => set({ peerConnection: pc }),
  setIsScreenSharing: (val) => set({ isScreenSharing: val }),
  setScreenStream: (stream) => set({ screenStream: stream }),
  setActiveVideoTrackType: (type) => set({ activeVideoTrackType: type }),
  setRemoteScreenSharing: (val) => set({ remoteScreenSharing: val }),

  toggleMute: () =>
    set((state) => {
      if (state.localStream) {
        const enabled = !state.isMuted
        state.localStream.getAudioTracks().forEach((t) => (t.enabled = !enabled))
        return { isMuted: enabled }
      }
      return state
    }),

  toggleCamera: () =>
    set((state) => {
      if (state.localStream) {
        const enabled = !state.isCameraOff
        state.localStream.getVideoTracks().forEach((t) => (t.enabled = !enabled))
        return { isCameraOff: enabled }
      }
      return state
    }),

  startScreenShare: () =>
    set((state) => ({
      isScreenSharing: true,
      activeVideoTrackType: 'screen',
    })),

  stopScreenShare: () =>
    set((state) => {
      if (state.screenStream) {
        state.screenStream.getTracks().forEach((t) => t.stop())
      }
      return {
        isScreenSharing: false,
        screenStream: null,
        activeVideoTrackType: state.localStream?.getVideoTracks().length > 0 ? 'camera' : 'camera',
      }
    }),

  endCall: () => {
    set((state) => {
      if (state.screenStream) {
        state.screenStream.getTracks().forEach((t) => t.stop())
      }
      if (state.localStream) {
        state.localStream.getTracks().forEach((t) => t.stop())
      }
      if (state.remoteStream) {
        state.remoteStream.getTracks().forEach((t) => t.stop())
      }
      if (state.peerConnection) {
        state.peerConnection.close()
      }
      return {
        incomingCall: null,
        callAccepted: false,
        callEnded: true,
        inCall: false,
        localStream: null,
        remoteStream: null,
        peerConnection: null,
        isMuted: false,
        isCameraOff: false,
        callType: null,
        isScreenSharing: false,
        screenStream: null,
        activeVideoTrackType: 'camera',
        remoteScreenSharing: false,
      }
    })
  },

  resetCall: () =>
    set({
      incomingCall: null,
      callAccepted: false,
      callEnded: false,
      inCall: false,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isMuted: false,
      isCameraOff: false,
      callType: null,
      isScreenSharing: false,
      screenStream: null,
      activeVideoTrackType: 'camera',
      remoteScreenSharing: false,
    }),
}))

export const useIncomingCall = () => useCallStore((s) => s.incomingCall)
export const useCallAccepted = () => useCallStore((s) => s.callAccepted)
export const useCallEnded = () => useCallStore((s) => s.callEnded)
export const useInCall = () => useCallStore((s) => s.inCall)
export const useLocalStream = () => useCallStore((s) => s.localStream)
export const useRemoteStream = () => useCallStore((s) => s.remoteStream)
export const useIsMuted = () => useCallStore((s) => s.isMuted)
export const useIsCameraOff = () => useCallStore((s) => s.isCameraOff)
export const useCallType = () => useCallStore((s) => s.callType)
export const useIsScreenSharing = () => useCallStore((s) => s.isScreenSharing)
export const useScreenStream = () => useCallStore((s) => s.screenStream)
export const useActiveVideoTrackType = () => useCallStore((s) => s.activeVideoTrackType)
export const useRemoteScreenSharing = () => useCallStore((s) => s.remoteScreenSharing)

export default useCallStore
