// @flow

import type {
  Peer,
  PeerOptions
} from "../../../../src/client/provider/web-rtc/rtc-peer";

import Connection from "../connection.mock";

export default (options: PeerOptions): Peer => {
  const { onICE } = options;

  return {
    channel: jest.fn(async () => Connection()),
    offer: jest.fn(() => {
      // Dispatch dummy ICE candidate on offer.
      onICE({
        candidate: ""
      });
    }),
    answer: jest.fn(),
    setRemoteDescription: jest.fn(),
    addIceCandidate: jest.fn()
  };
};
