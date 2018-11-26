import { ConnectionProvider, Connection, ConnectionOptions } from "../types"
import { Message, Transport } from "@web-udp/protocol"

import shortid from "shortid"
import { RTCPeerConnection, RTCSessionDescription } from "wrtc"

import RTCPeer from "./rtc-peer"

const STUN = {
  urls: "stun:stun.l.google.com:19302",
}

const TURN = {
  urls: "turn:turn.bistri.com:80",
  username: "homeo",
  credential: "homeo",
}

const RTC_PEER_CONNECTION_OPTIONS = {
  iceServers: [STUN, TURN],
}

export type RTCConnectionProviderOptions = {
  transport: Transport
  onConnection?: (Connection) => any
}

export default class RTCConnectionProvider implements ConnectionProvider {
  private onPeerChannel: (Connection) => any
  private peers: { [peerId: string]: RTCPeer } = {}
  private transport: Transport

  constructor(options: RTCConnectionProviderOptions) {
    const { transport, onConnection = () => {} } = options

    this.transport = transport
    this.onPeerChannel = onConnection

    this.transport.subscribe(this._onMessage)
  }

  /**
   * Establish a UDP connection with a remote peer.
   */
  async create(pid: string, options?: ConnectionOptions): Promise<Connection> {
    const cid = shortid()
    const peer = this.peers[pid] || this._addPeer(pid)
    const channel = peer.channel(cid, options)
    const sdp = await peer.offer()

    this._onPeerSDP(sdp, pid)

    return await channel
  }

  /**
   * Handle a signaling message.
   */
  _onMessage = async (message: Message) => {
    switch (message.type) {
      // Route ICE candidates to peers.
      case "ICE": {
        const {
          src,
          payload: { ice },
        } = message

        if (typeof src !== "string") {
          return
        }

        const peer = this.peers[src]

        if (!peer) {
          throw new Error("Received ICE candidate for unestablished peer")
        }

        peer.addIceCandidate(ice)

        break
      }
      // Route session descriptions to peers.
      case "OFFER":
      case "ANSWER": {
        const {
          src,
          payload: { sdp },
        } = message
        const peer = this.peers[src] || this._addPeer(src)

        let description: RTCSessionDescription

        try {
          description = new RTCSessionDescription(sdp)
        } catch (e) {
          throw new Error("Invalid SDP")
        }

        peer.setRemoteDescription(description)

        if (message.type === "OFFER") {
          const sdp = await peer.answer()

          this._onPeerSDP(sdp, src)
        }

        break
      }
      case "KEEP_ALIVE": {
        this.transport.send({
          type: "KEEP_ALIVE_CLIENT",
        })
        break
      }
      default:
        break
    }
  }

  _addPeer(pid: string) {
    if (this.peers[pid]) {
      throw new Error(`RTCPeer with id ${pid} already exists.`)
    }

    const peerOptions = {
      onChannel: this.onPeerChannel,
      onClose: () => this._onPeerClose(pid),
      onICE: ice => this._onPeerICE(ice, pid),
      peerConnection: new RTCPeerConnection(RTC_PEER_CONNECTION_OPTIONS),
    }
    const peer = new RTCPeer(peerOptions)

    this.peers[pid] = peer

    return peer
  }

  _onPeerSDP = (sdp: RTCSessionDescriptionInit, pid: string) => {
    const payload = { sdp }

    let message

    if (sdp.type === "offer") {
      message = {
        type: "OFFER_CLIENT",
        pid,
        payload,
      }
    } else {
      message = {
        type: "ANSWER_CLIENT",
        pid,
        payload,
      }
    }

    this.transport.send(message)
  }

  _onPeerICE = (ice: RTCIceCandidate, pid: string) => {
    this.transport.send({
      type: "ICE_CLIENT",
      pid,
      payload: {
        ice,
      },
    })
  }

  _onPeerClose = (pid: string) => {
    delete this.peers[pid]
  }

  close(pid: string) {
    const peer = this.peers[pid]

    if (!peer) {
      return
    }

    peer.close()
  }
}
