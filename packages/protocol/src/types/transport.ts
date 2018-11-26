import { Message } from "./message"

export type MessageHandler = (Message) => any

export interface Transport {
  send(message: Message): void
  subscribe(handler: MessageHandler): void
  unsubscribe(handler: MessageHandler): void
  close(): void
}
