// @flow

import type { MessageHandler, Transport } from "..";

import type { Message } from "../message";

const serialize = JSON.stringify;
const deserialize = JSON.parse;

export default class WebSocketTransport implements Transport {
  _buffer: Message[] = [];
  _open: boolean = false;
  _socket: WebSocket;
  _subscribers: MessageHandler[] = [];

  constructor(socket: WebSocket) {
    this._socket = socket;

    if (socket.readyState === 1) {
      this._onOpen();
    } else {
      this._socket.addEventListener("open", this._onOpen);
    }

    this._socket.addEventListener("message", this._onMessage);
    this._socket.addEventListener("close", this._onClose);
  }

  _flush() {
    let message;

    while ((message = this._buffer.shift())) {
      this._socket.send(serialize(message));
    }
  }

  _onOpen = () => {
    this._open = true;
  };

  _onMessage = (e: Event) => {
    if (!e.data) {
      return;
    }

    const message: Message = deserialize((e.data: any));

    for (let i = 0; i < this._subscribers.length; i++) {
      this._subscribers[i](message);
    }
  };

  _onClose = () => {
    const message = {
      type: "TRANSPORT_CLOSE"
    };
    for (let i = 0; i < this._subscribers.length; i++) {
      this._subscribers[i](message);
    }
  };

  subscribe(handler: MessageHandler) {
    if (this._subscribers.indexOf(handler) > -1) {
      return;
    }
    this._subscribers.push(handler);
  }

  unsubscribe(handler: MessageHandler) {
    const i = this._subscribers.indexOf(handler);

    if (i === -1) {
      return;
    }

    this._subscribers.splice(i, 1);
  }

  send(message: Message) {
    this._buffer.push(message);

    if (!this._open) {
      return;
    }

    this._flush();
  }

  close() {
    this._socket.close();
  }
}
