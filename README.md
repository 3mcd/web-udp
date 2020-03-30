# web-udp

web-udp is a library used to establish unreliable data channels in Node/browser environments. The key goal of this project to provide a small, stable API that anyone can use to work with real-time data on the web.

The library is currently implemented as an abstraction on top of unordered and unreliable RTCDataChannels. Since WebRTC is a dependency, a WebSocket based signaling server is included with the package to facilitate connections between clients. Client/server connections are available with the help of the [wrtc](https://www.npmjs.com/package/wrtc) package.

## API

```js
Signal<T>.subscribe(subscriber: T => any)
Signal<T>.unsubscribe(subscriber: T => any)

Client(options?: { url?: string })
Client.connect(to?: string = "__MASTER__", options?: {
  binaryType?: "arraybuffer" | "blob",
  maxRetransmits?: number,
  maxPacketLifeTime?: number,
  metadata?: any,
  UNSAFE_ordered?: boolean
}): Promise<Connection>
Client.route(): Promise<string>
Client.connections: Signal<Connection>

Connection.send(message: any): void
Connection.close(): void
Connection.closed: Signal
Connection.errors: Signal<{ err: string }>
Connection.messages: Signal<any>
Connection.metadata: any

// Node
Server({ server: http.Server, keepAlivePeriod?: number = 30000 })
Server.client(): Client
Server.connections: Signal<Connection>
```

## Installation

```sh
npm i @web-udp/client
npm i @web-udp/server
```

## Examples

### Client/Server

Below is a simple example of a ping server:

```js
// client.js

import { Client } from "@web-udp/client"

async function main() {
  const udp = new Client()
  const connection = await udp.connect()

  connection.send("ping")
  connection.messages.subscribe(console.log)
}
```

```js
// server.js

const server = require("http").createServer()
const { Server } = require("@web-udp/server")

const udp = new Server({ server })

udp.connections.subscribe(connection => {
  connection.messages.subscribe(message => {
    if (message === "ping") {
      connection.send("pong")
    }
  })

  connection.closed.subscribe(() => console.log("A connection closed."))

  connection.errors.subscribe(err => console.log(err))
})

server.listen(8000)
```

### Metadata

The `metadata` option in `Client.connect` is used to send arbitrary handshake data immediately after establishing a connection. When a new connection is opened, the remote client can access this data on the `metadata` property of the connection object without having to subscribe to the remote client's messages. This data is sent over a secure `RTCDataChannel`, making it a good candidate for sensitive data like passwords.

In the below example, a server can handle authentication before subscribing to the client's messages:

```js
// client.js

const connection = await udp.connect({
  metadata: {
    credentials: {
      username: "foo",
      password: "bar",
    },
  },
})
```

```js
// server.js

udp.connections.subscribe(connection => {
  let user

  try {
    user = await fakeAuth.login(connection.metadata.credentials)
  } catch (err) {
    // Authentication failed, close connection immediately.
    connection.send(fakeProtocol.loginFailure())
    connection.close()
    return
  }
  // The user authenticated successfully.
  connection.send(fakeProtocol.loginSuccess(user))
  connection.messages.subscribe(...)
})
```

### P2P

Of course this library also supports peer-to-peer communication. The below example demonstrates two clients connected to eachother in the same browser tab. The example could be easily adapted to two machines, but the users' identities would have to be exchanged at the application level since web-udp doesn't doesn't provide rooms or peer brokering out of the box.

```html
<!-- index.html -->

<script src="/node_modules/@web-udp/client/dist/index.js"></script>
<script src="client.js"></script>
```

```js
// client.js

async function main() {
  const left = new Udp.Client()
  const right = new Udp.Client()
  const route = await left.route()
  const connection = await right.connect(route)

  left.connections.subscribe(connection =>
    connection.messages.subscribe(console.log),
  )

  connection.send("HELLO")
}
```

```js
// server.js

const server = require("http").createServer()
const { Server } = require("@web-udp/server")

Server({ server })

server.listen(8000)
```

## Reliability

`Client.connect` optionally takes the RTCDataChannel [`maxPacketLifeTime`](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel/maxPacketLifeTime) and [`maxRetransmits`](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel/maxRetransmits) options. These options can be used to enable an unordered and reliable data channel.

## Known Issues

WebSockets are used as the signaling transport via the [`ws`](https://www.npmjs.com/package/ws) package. Due to a current issue in the wrtc library, this socket is kept open after the DataChannel is established to forward it's close event (e.g. when a browser tab is closed) in order to terminate hanging UDP connections. A keepalive signal is sent periodically to keep the socket open in the case of hosts with connection timeouts. The period at which the keepalive signal is sent can be configured via the server's `keepAlivePeriod` option.

## License

Copyright 2018 Eric McDaniel

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
