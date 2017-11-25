// @flow

import type { MessageHandler, Transport } from "..";

import type { Message } from "../message";

export default class LocalTransport implements Transport {
  _subscribers: MessageHandler[] = [];

  subscribe = (handler: MessageHandler) => {
    if (this._subscribers.indexOf(handler) > -1) {
      return;
    }

    this._subscribers.push(handler);
  };

  unsubscribe = (handler: MessageHandler) => {
    const i = this._subscribers.indexOf(handler);

    if (i === -1) {
      return;
    }

    this._subscribers.splice(i, 1);
  };

  send = (message: Message) => {
    for (let i = 0; i < this._subscribers.length; i++) {
      this._subscribers[i](message);
    }
  };

  bind(transport: LocalTransport) {
    const left = this.send;
    const right = transport.send;

    // Route messages from right -> left
    this.send = right.bind(transport);
    // Route messages from left -> right
    transport.send = left.bind(this);

    return this;
  }
}
