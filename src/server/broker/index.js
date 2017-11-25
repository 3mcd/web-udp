// @flow

import shortid from "shortid";

import type { Message, Transport } from "../../protocol";

export default class Broker {
  _transports: { [id: string]: Transport } = {};

  register(transport: Transport, id: string = shortid()) {
    this._transports[id] = transport;
    transport.subscribe((message: Message) =>
      this._onMessage(message, id)
    );
    return id;
  }

  _onMessage = (message: Message, src: string) => {
    switch (message.type) {
      case "OFFER_CLIENT": {
        const { payload, pid } = message;

        if (!this._transports[pid]) {
          throw new Error(`Client ${pid} not found.`);
        }

        this._transports[pid].send({
          type: "OFFER",
          src,
          payload: {
            sdp: payload.sdp
          }
        });
        break;
      }
      case "ANSWER_CLIENT": {
        const { payload, pid } = message;

        if (!this._transports[pid]) {
          throw new Error(`Client ${pid} not found.`);
        }

        this._transports[pid].send({
          type: "ANSWER",
          src,
          payload: {
            sdp: payload.sdp
          }
        });
        break;
      }
      case "ICE_CLIENT": {
        const { payload, pid } = message;

        if (!this._transports[pid]) {
          throw new Error(`Client ${pid} not found.`);
        }

        this._transports[pid].send({
          type: "ICE",
          src,
          payload: {
            ice: payload.ice
          }
        });
        break;
      }
      default:
        throw new Error(`Invalid message type ${message.type}.`);
    }
  };
}
