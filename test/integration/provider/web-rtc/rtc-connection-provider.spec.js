// @flow

jest.mock("wrtc", () => require("../../../mocks/vendor/wrtc.mock"));

import RTCConnectionProvider from "../../../../src/client/provider/web-rtc/rtc-connection-provider";

import Transport from "../../../mocks/protocol/transport.mock";

import { tick } from "../../../util/async";

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
      const connection = provider.create("foo", "0");

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
