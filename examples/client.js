const client = UDP("ws://localhost:4000", connection => {
  const { subscribe, send } = connection;
  window.send = send;
  send("PING");
  subscribe(console.log);
});

async function main() {
  const master = await client.connect();
}

main();
