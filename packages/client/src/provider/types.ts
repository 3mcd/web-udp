import { Signal } from "@web-udp/protocol"

export enum ConnectionState {
  CLOSED,
  OPENED,
}

export interface Connection {
  state: ConnectionState
  send(mixed): void
  close(): void
  closed: Signal
  errors: Signal<{ error: string }>
  messages: Signal
  metadata: any
}

export interface ConnectionProvider {
  create(
    pid: string,
    options?: ConnectionOptions,
  ): Promise<Connection>
  close(pid: string): void
}

export interface ConnectionOptions {
  binaryType?: "arraybuffer" | "blob"
  metadata?: any
  maxPacketLifeTime?: number
  maxRetransmits?: number
}

export type PortRange = {
  min: number
  max: number
}
