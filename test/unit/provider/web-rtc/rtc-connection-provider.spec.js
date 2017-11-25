// @flow

jest.mock("../../../../src/client/provider/web-rtc/rtc-peer", () =>
  require("../../../mocks/provider/web-rtc/rtc-peer.mock")
);

jest.mock("wrtc", () => require("../../../mocks/Vendor/wrtc.mock"));

import type { Message } from "../../../../src/protocol/message";
import type { Connection } from "../../../../src/client/provider";

import RTCConnectionProvider from "../../../../src/client/provider/web-rtc/rtc-connection-provider";

import Transport from "../../../mocks/protocol/transport.mock";

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
    const connection = webRtcConnectionProvider.create("foo", "0");

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
