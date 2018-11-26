type Route = {
  type: "ROUTE"
  route: string
}

type OfferClient = {
  type: "OFFER_CLIENT"
  pid: string
  payload: {
    sdp: RTCSessionDescriptionInit
  }
}

type Offer = {
  type: "OFFER"
  src: string
  payload: {
    sdp: RTCSessionDescriptionInit
  }
}

type AnswerClient = {
  type: "ANSWER_CLIENT"
  pid: string
  payload: {
    sdp: RTCSessionDescriptionInit
  }
}

type Answer = {
  type: "ANSWER"
  src: string
  payload: {
    sdp: RTCSessionDescriptionInit
  }
}

type Ice = {
  type: "ICE_CLIENT"
  pid: string
  payload: {
    ice: RTCIceCandidateInit
  }
}

type IceClient = {
  type: "ICE"
  src: string
  payload: {
    ice: RTCIceCandidateInit
  }
}

type TransportClose = {
  type: "TRANSPORT_CLOSE"
}

type KeepAlive = {
  type: "KEEP_ALIVE"
}

type KeepAliveClient = {
  type: "KEEP_ALIVE_CLIENT"
}

export type Message =
  | Route
  | OfferClient
  | Offer
  | AnswerClient
  | Answer
  | IceClient
  | Ice
  | TransportClose
  | KeepAlive
  | KeepAliveClient
