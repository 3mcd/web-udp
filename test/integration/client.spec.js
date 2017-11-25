// @flow

jest.mock("wrtc", () => require("../mocks/Vendor/wrtc.mock"));

import Client from "../../src/client/client";
import RTCConnectionProvider from "../../src/client/provider/web-rtc/rtc-connection-provider";

import { tick } from "../util/async";

import Transport from "../mocks/protocol/transport.mock";

describe("Client.RTCConnectionProvider", () => {
  let provider;
  let transport;
  let onConnection;
  let client;

  beforeEach(() => {
    transport = Transport();
    onConnection = jest.fn();
    provider = new RTCConnectionProvider({
      transport,
      onConnection
    });
    client = new Client({
      provider
    });
  });

  it("emits connections after they are established", async () => {
    const pid = "foo";
    const connect = client.connect(pid);

    // RTCPeerConnection.createOffer will execute immediately to set
    // local description. The offer is then dispatched to the remote
    // peer.
    await tick();

    // Simulate remote answer.
    transport.__provide__({
      type: "ANSWER",
      src: pid,
      payload: {
        sdp: {
          sdp: "",
          type: "answer"
        }
      }
    });

    expect(onConnection).toHaveBeenCalledWith(await connect);
  });
});
