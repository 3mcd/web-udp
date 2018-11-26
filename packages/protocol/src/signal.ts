type Subscriber<E> = (event: E) => any

export class Signal<T = any> {
  private subscribers: Subscriber<T>[] = []

  dispatch(t: T) {
    for (const subscriber of this.subscribers) {
      subscriber(t)
    }
  }

  subscribe(subscriber: Subscriber<T>) {
    if (this.subscribers.indexOf(subscriber) > -1) {
      return
    }
    this.subscribers.push(subscriber)
  }

  unsubscribe(subscriber: Subscriber<T>) {
    const index = this.subscribers.indexOf(subscriber)

    if (index < 0) {
      return
    }

    this.subscribers.splice(index, 1)
  }
}
