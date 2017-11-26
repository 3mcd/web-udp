// @flow

import type { RTCIceCandidate, RTCSessionDescription } from "wrtc";

type Route = {
  type: "ROUTE",
  route: string
};

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

type Open = {
  type: "OPEN"
};

type TransportClose = {
  type: "TRANSPORT_CLOSE"
};

export type Message =
  | Route
  | Open
  | OfferClient
  | Offer
  | AnswerClient
  | Answer
  | IceClient
  | Ice
  | TransportClose;
