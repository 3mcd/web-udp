// @flow

jest.mock("./rtc-peer", () =>
  require("../../../../../test/mocks/provider/web-rtc/rtc-peer.mock")
);

jest.mock("wrtc", () =>
  require("../../../../../test/mocks/vendor/wrtc.mock")
);

import type { Connection } from "../..";

import RTCConnectionProvider from "./rtc-connection-provider";

import Transport from "../../../../../test/mocks/protocol/transport.mock";

import { tick } from "../../../../../test/util/async";

describe("RTCConnectionProvider", () => {
  let transport;
  let onConnection;
  let webRtcConnectionProvider;

  beforeEach(() => {
    transport = Transport();
    onConnection = jest.fn((connection: Connection) => {});
    webRtcConnectionProvider = new RTCConnectionProvider({
      transport,
      onConnection
    });
  });

  it("sends ICE data broadcast by peer instances", () => {
    const connection = webRtcConnectionProvider.create("foo", {
      binaryType: "arraybuffer"
    });

    expect(transport.send).toHaveBeenCalledWith({
      pid: "foo",
      type: "ICE_CLIENT",
      payload: {
        ice: {
          candidate: ""
        }
      }
    });
  });
});

describe("RTCConnectionProvider.RTCPeer", () => {
  let transport;
  let onConnection;
  let provider;

  beforeEach(() => {
    transport = Transport();
    onConnection = jest.fn();
    provider = new RTCConnectionProvider({
      transport,
      onConnection
    });
  });

  describe("create()", () => {
    it("sends offers created by peers", async () => {
      const connection = provider.create("foo", {
        binaryType: "arraybuffer"
      });

      await tick();

      expect(transport.send).toHaveBeenCalledWith({
        type: "OFFER_CLIENT",
        pid: "foo",
        payload: {
          sdp: {
            sdp: "",
            type: "offer"
          }
        }
      });
    });
  });

  describe("handle()", () => {
    it("sends answer on remote offer", async () => {
      transport.__provide__({
        type: "OFFER",
        src: "foo",
        payload: {
          sdp: {
            sdp: "",
            type: "offer"
          }
        }
      });

      await tick();

      expect(transport.send).toHaveBeenCalledWith({
        type: "ANSWER_CLIENT",
        pid: "foo",
        payload: {
          sdp: {
            sdp: "",
            type: "answer"
          }
        }
      });
    });
  });
});
