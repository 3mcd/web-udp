const client = Udp.client("ws://localhost:4000");

async function main() {
  const { send, subscribe } = await client.connect();
  window.send = send;
  send("PING");
  subscribe(console.log);
}

main();
