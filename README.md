# web-udp

web-udp is a library used to establish UDP connections in Node/browser environments. The key goal of this project to provide a small, stable API that anyone can use to work with real-time data on the Web.

The library is currently implemented as an abstraction on top of unreliable RTCDataChannels. Since WebRTC is a dependency, a signaling server is included with the package to facilitate connections between clients. Client/server connections are available with the help of the [wrtc](https://www.npmjs.com/package/wrtc) package.

This project is a WIP.

## API

```js
Signal<T>#subscribe(subscriber: (data: *) => *)
Signal<T>#unsubscribe(subscriber: (data: *) => *)

Client(options?: { url?: string })
Client#connect(to?: string = "__MASTER__"): Promise<Connection>
Client#route(): Promise<string>
Client#connections: Signal<Connection>

Connection: Signal<*>
Connection#send(message: *): void
Connection#close(): void
Connection#closed: Signal<>
Connection#errors: Signal<{ err: string }>

// Node
Server({ server: http.Server })
Server#client(connectionSubscriber: Connection => *): Client
Client#connections: Signal<Connection>
```

## Examples

### Client/Server

```js
// client.js

import { Client } from "web-udp";

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
const { Server } = require("web-udp");

const udp = new Server({ server });

udp.connections.subscribe(
  connection => {
    const { send, subscribe, errors, closed } = connection;

    subscribe(
      message => {
        if (message === "ping") {
          send("pong");
        }
      }
    );

    closed.subscribe(
      () => console.log("A connection closed.")
    );

    errors.subscribe(
      err => console.log(err)
    );
  }
);

server.listen(8000);
```

### P2P

```js
// client.js

async function main() {
  const left = new Client();
  const right = new Client();
  const route = await left.route();
  const connection = await right.connect(route);

  left.connections.subscribe(
    ({ subscribe }) => subscribe(console.log)
  );

  connection.send("HELLO");
}
```

```js
// server.js

const server = require("http").createServer();
const { Server } = require("web-udp");

Server({ server });

server.listen(8000);
```
