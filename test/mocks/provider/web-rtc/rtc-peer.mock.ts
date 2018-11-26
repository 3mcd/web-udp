// @flow

import {
  Peer,
  PeerOptions,
} from "../../../../packages/client/src/provider/web-rtc/rtc-peer"

import { RTCSessionDescription } from "../../vendor/wrtc.mock"
import Connection from "../connection.mock"

export default class RTCPeerMock implements Peer {
  channel = jest.fn(async () => Connection())
  answer = jest.fn(() =>
    Promise.resolve(
      new RTCSessionDescription({
        sdp: "",
        type: "answer",
      }),
    ),
  )
  setRemoteDescription = jest.fn()
  addIceCandidate = jest.fn()
  offer = jest.fn()

  constructor(options: PeerOptions) {
    this.offer = jest.fn(() => {
      // Dispatch dummy ICE candidate on offer.
      options.onICE({
        candidate: "",
      })

      return Promise.resolve(
        new RTCSessionDescription({
          sdp: "",
          type: "offer",
        }),
      )
    })
  }
}
