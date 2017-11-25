# udp-web

udp-web is a library used to establish simple UDP connections in Node/browser environments. The key goal of this project to provide a simple, stable API that anyone can use to get up and running with UDP on the Web.

The library is currently implemented as simple abstraction on top of unreliable RTCDataChannels. Since WebRTC is a dependency, a signaling server is included with the package to facilitate connections between clients. Client/server connections are available with the help of the Node [wrtc](https://www.npmjs.com/package/wrtc) module. Configuration includes ordered (SCTP) and unordered (UDP) channels.

This project is a WIP.

## Examples

### Target v1 API
```js
exports(server: string | http.Server, connectionSubscriber: Connection => *): Client

Client#connect(id?: string = "MASTER"): Promise<Connection>

Connection#send(message: *): void
Connection#subscribe(messageSubscriber: (message: *) => *): void
```

### Client/Server

```js
// client.js

import { Client } from "udp-web";

function* main() {
  const client = new Client();
  const { send, subscribe } = await client.connect();

  send("ping");
  subscribe(console.log);
}
```

```js
// server.js

const server = require("http").createServer();
const client = require("udp-web")(server, connection => {
  const { send, subscribe } = connection;
  subscribe(message => {
    if (message === "ping") {
      send("pong");
    }
  });
});

server.listen(8000);
```

### P2P

```js
// client1.js

function* main() {
  const client = new Client();
  const { send, subscribe } = await client.connect("foo");

  send("ping");
  subscribe(console.log);
}
```

```js
// client2.js

const client = new Client("foo", connection => {
  const { send, subscribe } = connection;
  subscribe(message => {
    if (message === "ping") {
      send("pong");
    }
  });
});
```

```js
// server.js

const server = require("http").createServer();
const client = require("udp-web")(server);

server.listen(8000);
```
