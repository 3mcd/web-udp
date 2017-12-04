// @flow

type Subscriber = T => any;

export class Signal<T> {
  _subscribers: Subscriber[] = [];

  _dispatch = (data: T) => {
    for (const subscriber of this._subscribers) {
      subscriber(data);
    }
  }

  subscribe = (subscriber: Subscriber<T>) => {
    if (this._subscribers.indexOf(subscriber) > -1) {
      return;
    }
    this._subscribers.push(subscriber);
  }

  unsubscribe = (subscriber: Subscriber<T>) => {
    const index = this._subscribers.indexOf(subscriber);
    if (index < 0) {
      return;
    }
    this._subscribers.splice(index, 1);
  }
}
