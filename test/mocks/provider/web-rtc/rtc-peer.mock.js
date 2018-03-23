// @flow

import type {
  Peer,
  PeerOptions,
} from "../../../../packages/client/src/provider/web-rtc/rtc-peer"

import { RTCSessionDescription } from "../../vendor/wrtc.mock"
import Connection from "../connection.mock"

export default (options: PeerOptions): Peer => {
  const { onICE } = options

  return {
    channel: jest.fn(async () => Connection()),
    offer: jest.fn(() => {
      // Dispatch dummy ICE candidate on offer.
      onICE({
        candidate: "",
      })

      return Promise.resolve(
        new RTCSessionDescription({
          sdp: "",
          type: "offer",
        }),
      )
    }),
    answer: jest.fn(() =>
      Promise.resolve(
        new RTCSessionDescription({
          sdp: "",
          type: "answer",
        }),
      ),
    ),
    setRemoteDescription: jest.fn(),
    addIceCandidate: jest.fn(),
  }
}
