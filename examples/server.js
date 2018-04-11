const http = require("http")
const server = http.createServer()
const { Server } = require("../packages/server/lib")

const udp = new Server({
  server,
})

udp.connections.subscribe(connection => {
  const { credentials } = connection.metadata

  if (
    credentials &&
    (credentials.username !== "foo" || credentials.password !== "bar")
  ) {
    connection.send("AUTH_FAIL")
    connection.close()
    return
  }

  connection.messages.subscribe(message => {
    if (message === "PING") {
      setTimeout(() => connection.send("PONG"), 1000)
    } else if (message === "PULL") {
      setInterval(() => connection.send("PUSH"), 1000)
    }
  })
})

const client = udp.client()

client.connect().then(connection => {
  connection.messages.subscribe(message => {
    console.log(message)
    if (message === "PONG") {
      connection.send("PING")
    }
  })
  connection.send("PING")
})

server.listen(4000)
