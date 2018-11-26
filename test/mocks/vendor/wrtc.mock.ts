export type RTCSessionDescriptionOptions = {
  sdp: string,
  type: "offer" | "answer",
}

export type RTCIceCandidate = {
  candidate: string,
}

export type RTCIceCandidateEvent = {
  candidate: RTCIceCandidate,
}

export type RTCDataChannelEvent = {
  channel: RTCDataChannel,
}

export type RTCPeerConnectionMockUtil = {
  __triggerDataChannel__(RTCDataChannelEvent): void,
  __triggerIceCandidate__(RTCIceCandidateEvent): void,
}

export class RTCSessionDescription {
  sdp: string

  type: "offer" | "answer"

  constructor(options: RTCSessionDescriptionOptions) {
    const { sdp, type } = options

    this.sdp = sdp
    this.type = type
  }
}

export class RTCDataChannel {
  _onOpen: (...args: any[]) => any = () => {}

  constructor() {}

  addEventListener(event: string, cb: (...args: any[]) => any) {
    if (event === "open") {
      this._onOpen = cb
    }
  }

  removeEventListener(event: string, cb: (...args: any[]) => any) {
    if (event === "open") {
      this._onOpen = () => {}
    }
  }

  send(data: any) {}

  __open__() {
    this._onOpen()
  }
}

export class RTCPeerConnection {
  _channels: RTCDataChannel[] = []

  _local: RTCSessionDescription

  _remote: RTCSessionDescription

  _onDataChannel: (RTCDataChannelEvent) => any

  _onIceCandidate: (RTCIceCandidateEvent) => any

  addEventListener(event: string, cb: (...args: any[]) => any) {
    if (event === "icecandidate") {
      this._onIceCandidate = cb
    } else if (event === "datachannel") {
      this._onDataChannel = cb
    }
  }

  async createAnswer() {
    return new RTCSessionDescription({
      sdp: "",
      type: "answer",
    })
  }

  createDataChannel(): RTCDataChannel {
    const channel = new RTCDataChannel()

    this._channels.push(channel)

    return channel
  }

  async createOffer() {
    return new RTCSessionDescription({
      sdp: "",
      type: "offer",
    })
  }

  setLocalDescription(sdp: RTCSessionDescription) {
    this._local = sdp
    this.__tryOpen__()
  }

  setRemoteDescription(sdp: RTCSessionDescription) {
    this._remote = sdp
    this.__tryOpen__()
  }

  __tryOpen__() {
    if (!(this._remote && this._local)) {
      return
    }

    this._channels.forEach(c => c.__open__())
  }

  __triggerDataChannel__(e: RTCDataChannelEvent) {
    this._onDataChannel(e)
  }

  __triggerIceCandidate__(e: RTCIceCandidateEvent) {
    this._onIceCandidate(e)
  }
}
