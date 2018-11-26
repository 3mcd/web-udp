declare module "wrtc" {
  const RTCIceCandidate: { new(...args: any[]): RTCIceCandidate }
  const RTCSessionDescription: { new(...args: any[]): RTCSessionDescription }
  const RTCDataChannel: { new(...args: any[]): RTCDataChannel }
  const RTCPeerConnection: { new(...args: any[]): RTCPeerConnection }

  export { RTCIceCandidate, RTCSessionDescription, RTCDataChannel, RTCPeerConnection }
}
