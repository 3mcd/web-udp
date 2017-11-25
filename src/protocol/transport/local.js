// @flow

import type { MessageHandler, Transport } from "..";

import type { Message } from "../message";

export default class LocalTransport implements Transport {
  static create() {
    const left = new LocalTransport();
    const right = new LocalTransport();

    const temp = left.send;

    // Route messages from right -> left
    left.send = right.send.bind(right);
    // Route messages from left -> right
    right.send = temp.bind(left);

    return { left, right };
  }

  _subscribers: MessageHandler[] = [];

  constructor() {
    this.send({
      type: "OPEN"
    });
  }

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
}
