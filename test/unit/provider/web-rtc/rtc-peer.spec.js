// @flow

jest.mock("wrtc", () => require("../../../mocks/vendor/wrtc.mock"));

import RTCPeer from "../../../../src/client/provider/web-rtc/rtc-peer";

import { tick } from "../../../util/async";
import Connection from "../../../mocks/provider/connection.mock";

import {
  RTCDataChannel,
  RTCPeerConnection,
  RTCSessionDescription
} from "../../../mocks/vendor/wrtc.mock";

describe("RTCPeer", () => {
  let onChannel;
  let onClose;
  let onICE;
  let onSDP;
  let pc;
  let peer;

  beforeEach(() => {
    onChannel = jest.fn();
    onClose = jest.fn();
    onICE = jest.fn();
    onSDP = jest.fn();
    pc = new RTCPeerConnection();
    peer = new RTCPeer({
      pc,
      onChannel,
      onClose,
      onICE,
      onSDP
    });
  });

  describe("channel()", () => {
    it("resolves with a Connection when underlying datachannel opens", async () => {
      const connect = peer.channel("foo");

      // Trigger "open" by setting the remote/local description of
      // the mock manually.
      pc.setLocalDescription(
        new RTCSessionDescription({ sdp: "", type: "offer" })
      );
      pc.setRemoteDescription(
        new RTCSessionDescription({ sdp: "", type: "answer" })
      );

      const connection = await connect;

      expect(connection).toBeTruthy();
    });

    it("emits DataChannel when underlying datachannel opens", async () => {
      const connect = peer.channel("foo");

      // Trigger "open" by setting the remote/local description of
      // the mock manually.
      pc.setLocalDescription(
        new RTCSessionDescription({ sdp: "", type: "offer" })
      );
      pc.setRemoteDescription(
        new RTCSessionDescription({ sdp: "", type: "answer" })
      );

      const connection = await connect;

      expect(onChannel).toHaveBeenCalledWith(connection);
    });
  });

  it("emits ICE data", () => {
    const candidate = {
      candidate: ""
    };

    pc.__triggerIceCandidate__({
      candidate
    });

    expect(onICE).toHaveBeenCalledWith(candidate);
  });

  it("emits SDP data", () => {
    peer.offer();

    expect(onSDP).toHaveBeenCalledWith({
      sdp: "",
      type: "offer"
    });

    peer.answer();

    expect(onSDP).toHaveBeenCalledWith({
      sdp: "",
      type: "answer"
    });
  });
});
