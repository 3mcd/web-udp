// @flow

import type { RTCDataChannel } from "wrtc";

import type { Connection } from "..";

type DataChannelOptions = {
  dc: RTCDataChannel,
  id: string
};

type DataChannelSubscriber = (data: mixed) => mixed;

export default class DataChannel implements Connection {
  _dc: RTCDataChannel;

  get id(): string {
    return this._dc.label;
  }

  _subscribers: DataChannelSubscriber[] = [];

  constructor(options: DataChannelOptions) {
    const { dc } = options;

    this._dc = dc;

    dc.addEventListener("message", this._onMessage);
  }

  _onMessage = (e: mixed) => {
    const { data } = e;
    this._subscribers.forEach(subscriber => subscriber(data));
  };

  send = (message: mixed) => {
    this._dc.send(message);
  };

  subscribe = (subscriber: DataChannelSubscriber) => {
    this._subscribers.push(subscriber);
  };

  unsubscribe = (subscriber: DataChannelSubscriber) => {
    this._subscribers.splice(
      this._subscribers.indexOf(subscriber),
      1
    );
  };
}
