# udp-web

udp-web is a library used to establish UDP connections in Node/browser environments. The key goal of this project to provide a small, stable API that anyone can use to work with real-time data on the Web.

The library is currently implemented as an abstraction on top of unreliable RTCDataChannels. Since WebRTC is a dependency, a signaling server is included with the package to facilitate connections between clients. Client/server connections are available with the help of the [wrtc](https://www.npmjs.com/package/wrtc) package.

This project is a WIP.

## Examples

### Target v1 API
```js
Client(options?: { url?: string, onConnection?: Connection => * })
Client#connect(to?: string = "__MASTER__"): Promise<Connection>
Client#route(): Promise<string>

Connection#send(message: *): void
Connection#subscribe(messageSubscriber: (message: *) => *): void
Connection#unsubscribe(messageSubscriber: (message: *) => *): void
Connection#close(): void

// Node
Server({ server: http.Server, onConnection: Connection => * })
Server#client(connectionSubscriber: Connection => *): Client
```

### Client/Server

```js
// client.js

import { Client } from "udp-web";

async function main() {
  const client = new Client();
  const { send, subscribe } = await client.connect();

  send("ping");
  subscribe(console.log);
}
```

```js
// server.js

const server = require("http").createServer();
const { Server } = require("udp-web");

const udp = new Server({
  server,
  onConnection: connection => {
    const { send, subscribe } = connection;
    subscribe(message => {
      if (message === "ping") {
        send("pong");
      }
    });
  }
});

server.listen(8000);
```

### P2P

```js
// client.js

async function main() {
  const left = new Client({
    onConnection: ({ subscribe }) => subscribe(console.log)
  });
  const right = new Client();
  const route = await left.route();
  const connection = await right.connect(route);

  connection.send("HELLO");
}
```

```js
// server.js

const server = require("http").createServer();
const { Server } = require("udp-web");

Server({ server });

server.listen(8000);
```
