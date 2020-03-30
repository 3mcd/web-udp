import { Connection, ConnectionOptions } from "../types"

import {
  CHANNEL_MESSAGE_TYPE_KEY,
  CHANNEL_MESSAGE_TYPE_HANDSHAKE,
  CHANNEL_MESSAGE_PAYLOAD_KEY,
} from "@web-udp/protocol"
import RTCChannel from "./rtc-channel"

// Enforce UDP-like SCTP messaging
const DATA_CHANNEL_OPTIONS = {
  ordered: false,
}

export interface Peer {
  channel(
    id: string,
    options?: ConnectionOptions,
  ): Promise<Connection>
  offer(): Promise<RTCSessionDescriptionInit>
  answer(
    sdp: RTCSessionDescription,
  ): Promise<RTCSessionDescriptionInit>
  setRemoteDescription(sdp: RTCSessionDescription): void
  addIceCandidate(ice: RTCIceCandidate): void
}

export type PeerOptions = {
  onChannel: (channel: RTCChannel) => any
  onClose: (...args: any[]) => any
  onICE: (ice: RTCIceCandidate) => any
  peerConnection: RTCPeerConnection
}

function handshake(metadata?: any) {
  return {
    [CHANNEL_MESSAGE_TYPE_KEY]: CHANNEL_MESSAGE_TYPE_HANDSHAKE,
    [CHANNEL_MESSAGE_PAYLOAD_KEY]: metadata,
  }
}

function getType(message: Object) {
  return message[CHANNEL_MESSAGE_TYPE_KEY]
}

function getPayload(message: Object) {
  return message[CHANNEL_MESSAGE_PAYLOAD_KEY]
}

export default class RTCPeer implements Peer {
  private channels: { [channelId: string]: RTCChannel } = {}
  private onChannel: (channel: RTCChannel) => any
  private onClose: (...args: any[]) => any
  private onIce: (ice: RTCIceCandidate) => any
  private peerConnection: RTCPeerConnection

  constructor(options: PeerOptions) {
    const { onChannel, onClose, onICE, peerConnection } = options

    this.onIce = onICE
    this.onChannel = onChannel
    this.onClose = onClose

    this.peerConnection = peerConnection

    this.peerConnection.addEventListener("close", () => this.close())
    this.peerConnection.addEventListener(
      "datachannel",
      this.onDataChannel,
    )
    this.peerConnection.addEventListener(
      "icecandidate",
      this.onIceCandidate,
    )
    this.peerConnection.addEventListener(
      "signalingstatechange",
      this.onSignalingStateChange,
    )
  }

  private setLocalDescription = (sdp: RTCSessionDescriptionInit) => {
    this.peerConnection.setLocalDescription(sdp)
  }

  private onIceCandidate = (e: RTCPeerConnectionIceEvent) => {
    this.onIce(e.candidate)
  }

  private onDataChannel = (e: RTCDataChannelEvent) => {
    const { channel: dataChannel } = e

    let channel = this.channels[dataChannel.label]

    if (channel) {
      return
    }

    channel = this.channels[dataChannel.label] = new RTCChannel({
      dataChannel,
    })

    const handleMessage = (data: any) => {
      const message = JSON.parse(data)

      if (getType(message) === CHANNEL_MESSAGE_TYPE_HANDSHAKE) {
        channel.metadata = getPayload(message)
        this.onChannel(channel)
      }

      channel.messages.unsubscribe(handleMessage)
    }

    channel.messages.subscribe(handleMessage)
  }

  private onSignalingStateChange = () => {
    const { connectionState } = this.peerConnection

    switch (connectionState) {
      case "disconnected":
      case "failed":
      case "closed":
        this.onClose()
        break
      default:
        break
    }
  }

  channel = (
    cid: string,
    options: ConnectionOptions = {},
  ): Promise<Connection> => {
    const {
      maxPacketLifeTime,
      maxRetransmits,
      metadata = {},
      UNSAFE_ordered,
    } = options
    const dataChannelOptions: {
      ordered: boolean
      maxPacketLifeTime?: number
      maxRetransmits?: number
    } = {
      ...DATA_CHANNEL_OPTIONS,
    }

    if (UNSAFE_ordered) {
      dataChannelOptions.ordered = true
    }

    if (typeof maxPacketLifeTime === "number") {
      dataChannelOptions.maxPacketLifeTime = maxPacketLifeTime
    } else if (typeof maxRetransmits === "number") {
      dataChannelOptions.maxRetransmits = maxRetransmits
    }

    // Create a RTCDataChannel with the id as the label
    const dataChannel = this.peerConnection.createDataChannel(
      cid,
      dataChannelOptions,
    )

    dataChannel.binaryType = options.binaryType || "arraybuffer"

    const handleOpen = (done: (channel: RTCChannel) => any) => {
      const channel = new RTCChannel({ dataChannel })

      channel.metadata = metadata

      this.channels[dataChannel.label] = channel
      this.onChannel(channel)

      // Send local handshake
      channel.send(JSON.stringify(handshake(metadata)))

      done(channel)
    }

    return new Promise(resolve => {
      dataChannel.addEventListener("open", () => handleOpen(resolve))
    })
  }

  /**
   * Create an offer session description.
   */
  async offer() {
    let sdp: RTCSessionDescriptionInit

    try {
      sdp = await this.peerConnection.createOffer()
    } catch (e) {
      console.error(e)
    }

    this.setLocalDescription(sdp)

    return sdp
  }

  /**
   * Create an answer session description.
   */
  async answer() {
    let sdp: RTCSessionDescriptionInit

    try {
      sdp = await this.peerConnection.createAnswer()
    } catch (e) {
      console.error(e)
    }

    this.setLocalDescription(sdp)

    return sdp
  }

  /**
   * Handle remote session description generated by answer.
   */
  setRemoteDescription(sdp: RTCSessionDescription) {
    this.peerConnection.setRemoteDescription(sdp)
  }

  addIceCandidate(ice: RTCIceCandidateInit) {
    if (ice === null) {
      return
    }
    this.peerConnection.addIceCandidate(ice)
  }

  close() {
    if (this.peerConnection.connectionState !== "closed") {
      this.peerConnection.close()
    }

    for (let cid in this.channels) {
      this.channels[cid].close()
    }

    this.onClose()
  }
}
