// @flow

type Subscriber<T> = T => any;

export class Signal<T = *> {
  _subscribers: Subscriber<T>[] = [];

  dispatch(t: T) {
    for (const subscriber of this._subscribers) {
      subscriber(t);
    }
  }

  subscribe = (subscriber: Subscriber<T>) => {
    if (this._subscribers.indexOf(subscriber) > -1) {
      return;
    }
    this._subscribers.push(subscriber);
  };

  unsubscribe = (subscriber: Subscriber<T>) => {
    const index = this._subscribers.indexOf(subscriber);
    if (index < 0) {
      return;
    }
    this._subscribers.splice(index, 1);
  };
}
