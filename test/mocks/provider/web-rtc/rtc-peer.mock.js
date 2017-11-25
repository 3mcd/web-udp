// @flow

import type { RTCIceCandidate, RTCSessionDescription } from "wrtc";

import type {
  PeerInterface,
  PeerOptions
} from "../../../../src/client/provider/web-rtc/rtc-peer";

import Connection from "../connection.mock";

export default (options: PeerOptions): PeerInterface => {
  const { onICE, onSDP } = options;

  const mock = {
    channel: jest.fn(async (id: string) => Connection()),
    offer: jest.fn(() => {
      // Dispatch dummy ICE candidate on offer.
      onICE({
        candidate: ""
      });
    }),
    answer: jest.fn((sdp: RTCSessionDescription) => {}),
    setRemoteDescription: jest.fn((sdp: RTCSessionDescription) => {}),
    addIceCandidate: jest.fn((ice: RTCIceCandidate) => {})
  };

  return mock;
};
