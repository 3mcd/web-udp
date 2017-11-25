// @flow

import type { ConnectionProvider, Connection } from "..";
import type { PeerInterface } from "./rtc-peer";
import type { Message, Transport } from "../../../protocol";

import { RTCPeerConnection, RTCSessionDescription } from "wrtc";

import type { RTCIceCandidate } from "wrtc";

import RTCPeer from "./rtc-peer";

const STUN = {
  url: "stun:stun.l.google.com:19302"
};

const TURN = {
  url: "turn:homeo@turn.bistri.com:80",
  username: "homeo",
  credential: "homeo"
};

const RTC_PEER_CONNECTION_OPTIONS = {
  iceServers: [STUN, TURN]
};

export type RTCConnectionProviderOptions = {
  transport: Transport,
  onConnection?: Connection => void
};

export default class RTCConnectionProvider
  implements ConnectionProvider {
  _peers: { [string]: RTCPeer } = {};

  _transport: Transport;

  _onConnection: Connection => void;

  constructor(options: RTCConnectionProviderOptions) {
    const { transport, onConnection = connection => {} } = options;

    this._transport = transport;
    this._onConnection = onConnection;

    this._transport.subscribe(this._onMessage);
  }

  /**
   * Establish a UDP connection with a remote peer.
   */
  async create(pid: string, cid: string): Promise<Connection> {
    const peer = this._peers[pid] || this._addPeer(pid);
    const channel = peer.channel(cid);

    peer.offer();

    return await channel;
  }

  /**
   * Handle a signaling message.
   */
  _onMessage = (message: Message) => {
    switch (message.type) {
      // Route ICE candidates to peers.
      case "ICE": {
        const { src, payload: { ice } } = message;

        if (typeof src !== "string") {
          return;
        }

        const peer = this._peers[src];

        if (!peer) {
          throw new Error(
            "Received ICE candidate for unestablished peer"
          );
        }

        peer.addIceCandidate(ice);

        break;
      }
      // Route session descriptions to peers.
      case "OFFER":
      case "ANSWER": {
        const { src, payload: { sdp } } = message;
        const peer = this._peers[src] || this._addPeer(src);

        let description: RTCSessionDescription;

        try {
          description = new RTCSessionDescription(sdp);
        } catch (e) {
          throw new Error("Invalid SDP");
        }

        peer.setRemoteDescription(description);

        if (message.type === "OFFER") {
          peer.answer();
        }

        break;
      }
      default:
        break;
    }
  };

  _addPeer(id: string, local: boolean = true) {
    if (this._peers[id]) {
      throw new Error(`RTCPeer with id ${id} already exists.`);
    }

    const peer = new RTCPeer({
      pc: new RTCPeerConnection(RTC_PEER_CONNECTION_OPTIONS),
      onChannel: channel => this._onConnection(channel),
      onSDP: sdp => this._onSDP(sdp, id),
      onICE: ice => this._onICE(ice, id)
    });

    this._peers[id] = peer;

    return peer;
  }

  _onSDP = (sdp: RTCSessionDescription, pid: string) => {
    const payload = { sdp };

    let message;

    if (sdp.type === "offer") {
      message = {
        type: "OFFER_CLIENT",
        pid,
        payload
      };
    } else {
      message = {
        type: "ANSWER_CLIENT",
        pid,
        payload
      };
    }

    this._transport.send(message);
  };

  _onICE = (ice: RTCIceCandidate, pid: string) => {
    this._transport.send({
      type: "ICE_CLIENT",
      pid,
      payload: {
        ice
      }
    });
  };
}
