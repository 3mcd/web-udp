// @flow

declare var Udp: any

import fs from "fs"
import http from "http"
import puppeteer from "puppeteer"

import { Server } from "./server"

describe("Server", () => {
  let udp
  let server

  function setup() {
    server = http.createServer()
    udp = new Server({ server })

    udp.connections.subscribe((connection: any) => {
      connection.messages.subscribe(message => {
        if (message === "PING") {
          connection.send("PONG")
        }
      })
    })

    server.listen(5001)
  }

  function teardown() {
    server.close()
  }

  async function init() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.addScriptTag({
      path: "./packages/client/dist/index.browser.js",
    })

    return { browser, page }
  }

  beforeEach(setup)

  describe("Client.Server", () => {
    it("clients are provided a route from signaling server upon connection", async () => {
      const { browser, page } = await init()
      const res = await page.evaluate(() => {
        const client = new Udp.Client({
          url: "localhost:5001",
        })

        return client.route()
      })

      expect(typeof res).toBe("string")

      await browser.close()
    })

    it("clients can send data to the master client", async () => {
      const { browser, page } = await init()
      const res = await page.evaluate(() => {
        const client = new Udp.Client({
          url: "localhost:5001",
        })

        return new window.Promise((resolve, reject) => {
          client.connect().then(master => {
            master.messages.subscribe(message => {
              if (message === "PONG") {
                resolve(true)
              }
            })
            master.send("PING")
          })
        })
      })

      expect(res).toBe(true)

      await browser.close()
    })

    it("clients can send data to peers", async () => {
      const { browser, page } = await init()
      const res = await page.evaluate(() => {
        const left = new Udp.Client({
          url: "localhost:5001",
        })

        const right = new Udp.Client({
          url: "localhost:5001",
        })

        right.connections.subscribe(connection => {
          connection.messages.subscribe(message => {
            if (message === "PING") {
              connection.send("PONG")
            }
          })
        })

        return right.route().then(route => {
          return new window.Promise((resolve, reject) => {
            left.connect(route).then(connection => {
              connection.messages.subscribe(message => {
                if (message === "PONG") {
                  resolve(true)
                }
              })
              connection.send("PING")
            })
          })
        })
      })

      expect(res).toBe(true)

      await browser.close()
    })
  })

  afterEach(teardown)
})
