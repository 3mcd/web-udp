const http = require("http");
const server = http.createServer();
const { Server } = require("../lib/server");

const udp = new Server({
  server,
  onConnection: ({ send, subscribe }) => {
    subscribe(message => {
      if (message === "PING") {
        setTimeout(() => send("PONG"), 1000);
      } else if (message === "PULL") {
        setInterval(() => send("PUSH"), 1000);
      }
    });
  }
});

const client = udp.client();

client.connect().then(({ send, subscribe }) => {
  subscribe(message => {
    console.log(message);
    if (message === "PONG") {
      send("PING");
    }
  });
  send("PING");
});

server.listen(4000);
