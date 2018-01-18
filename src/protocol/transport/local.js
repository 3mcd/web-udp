// @flow

import type { Message } from "../message";
import type { MessageHandler, Transport } from "..";

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

  _closed: boolean = false;
  _subscribers: MessageHandler[] = [];

  subscribe = (handler: MessageHandler) => {
    if (this._closed || this._subscribers.indexOf(handler) > -1) {
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
    if (this._closed) {
      return;
    }
    for (let i = 0; i < this._subscribers.length; i++) {
      this._subscribers[i](message);
    }
  };

  close() {
    this._closed = true;
    this._subscribers = [];
  }
}
