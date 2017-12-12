// @flow

import shortid from "shortid";

import type { Message, Transport } from "../../protocol";

export default class Broker {
  _transports: { [route: string]: Transport } = {};

  register(transport: Transport, route: string = shortid()) {
    this._transports[route] = transport;

    transport.subscribe((message: Message) =>
      this._onMessage(message, route)
    );

    transport.send({
      type: "ROUTE",
      route
    });

    return route;
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
          throw new Error(`Client ${pid} not found`);
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
      case "TRANSPORT_CLOSE": {
        delete this._transports[src];
        break;
      }
      default:
        throw new Error(`Invalid message type ${message.type}`);
    }
  };
}
