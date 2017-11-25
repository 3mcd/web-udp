// @flow

import type { RTCIceCandidate, RTCSessionDescription } from "wrtc";

type OfferClient = {
  type: "OFFER_CLIENT",
  pid: string,
  payload: {
    sdp: RTCSessionDescription
  }
};

type Offer = {
  type: "OFFER",
  src: string,
  payload: {
    sdp: RTCSessionDescription
  }
};

type AnswerClient = {
  type: "ANSWER_CLIENT",
  pid: string,
  payload: {
    sdp: RTCSessionDescription
  }
};

type Answer = {
  type: "ANSWER",
  src: string,
  payload: {
    sdp: RTCSessionDescription
  }
};

type Ice = {
  type: "ICE_CLIENT",
  pid: string,
  payload: {
    ice: RTCIceCandidate
  }
};

type IceClient = {
  type: "ICE",
  src: string,
  payload: {
    ice: RTCIceCandidate
  }
};

export type Message =
  | OfferClient
  | Offer
  | AnswerClient
  | Answer
  | IceClient
  | Ice;
