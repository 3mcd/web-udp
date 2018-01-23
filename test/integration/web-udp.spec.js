import fs from "fs";
import http from "http";
import puppeteer from "puppeteer";

import { Server } from "../../src/server";

describe("WebUdp", () => {
  let udp;
  let server;
  let fileServer;

  function setup() {
    server = http.createServer();
    fileServer = http.createServer((req, res) => {
      fs.readFile("./index.html", (error, content) => {
        if (error) {
          res.writeHead(500);
          res.end(error.code);
          res.end();
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content, "utf-8");
      });
    });
    udp = new Server({ server });

    udp.connections.subscribe(connection => {
      connection.messages.subscribe(message => {
        if (message === "PING") {
          connection.send("PONG");
        }
      });
    });

    server.listen(5001);
    fileServer.listen(5000);
  }

  function teardown() {
    server.close();
    fileServer.close();
  }

  async function init() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("http://localhost:5000");
    await page.addScriptTag({ path: "./dist/client.js" });

    return { browser, page };
  }

  beforeEach(setup);

  describe("WebUdp", () => {
    it("clients are provided a route from signaling server uppon connection", async () => {
      const { browser, page } = await init();
      const res = await page.evaluate(() => {
        const client = new Udp.Client({
          url: "localhost:5001"
        });

        return client.route();
      });

      expect(typeof res).toBe("string");

      await browser.close();
    });

    it("clients can send and recieve data to/from the master server", async () => {
      const { browser, page } = await init();
      const res = await page.evaluate(() => {
        const client = new Udp.Client({
          url: "localhost:5001"
        });

        return new window.Promise((resolve, reject) => {
          client.connect().then(master => {
            master.messages.subscribe(message => {
              if (message === "PONG") {
                resolve(true);
              }
            });
            master.send("PING");
          });
        });
      });

      expect(res).toBe(true);

      await browser.close();
    });

    it("clients can send and recieve data to/from eachother", async () => {
      const { browser, page } = await init();
      const res = await page.evaluate(() => {
        const left = new Udp.Client({
          url: "localhost:5001"
        });

        const right = new Udp.Client({
          url: "localhost:5001"
        });

        right.connections.subscribe(connection => {
          connection.messages.subscribe(message => {
            if (message === "PING") {
              connection.send("PONG");
            }
          });
        });

        return right.route().then(route => {
          return new window.Promise((resolve, reject) => {
            left.connect(route).then(connection => {
              connection.messages.subscribe(message => {
                if (message === "PONG") {
                  resolve(true);
                }
              });
              connection.send("PING");
            });
          });
        });
      });

      expect(res).toBe(true);

      await browser.close();
    });
  });

  afterEach(teardown);
});
