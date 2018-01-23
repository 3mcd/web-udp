// @flow

import { Client } from "../../src/client/client";
import { CLIENT_MASTER } from "../../src/const";

import Provider from "../mocks/provider/provider.mock";
import Transport from "../mocks/protocol/transport.mock";

describe("Client", () => {
  let provider;
  let transport;
  let client;

  beforeEach(() => {
    transport = Transport();
    provider = new Provider();
    client = new Client({
      provider,
      transport
    });
  });

  it("attempts to connect to the master client when given no arguments", () => {
    client.connect();

    expect(provider.create).toHaveBeenCalledWith(CLIENT_MASTER);
  });

  it("attempts to connect to the master client when given a single options argument", () => {
    const options = { binaryType: "blob" };

    client.connect(options);

    expect(provider.create).toHaveBeenCalledWith(CLIENT_MASTER, options);
  });

  it("attempts to connect to the specified client when given a single string argument", () => {
    const to = "foo";

    client.connect(to);

    expect(provider.create).toHaveBeenCalledWith(to);
  });

  it("attempts to connect to the specified client with options when given two corresponding arguments", () => {
    const to = "foo";
    const options = { binaryType: "blob" };

    client.connect(to, options);

    expect(provider.create).toHaveBeenCalledWith(to, options);
  });
});
