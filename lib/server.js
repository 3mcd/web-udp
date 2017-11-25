"use strict";

function _interopDefault(ex) {
  return ex && typeof ex === "object" && "default" in ex
    ? ex["default"]
    : ex;
}

var ws = require("ws");
var _regeneratorRuntime = _interopDefault(
  require("babel-runtime/regenerator")
);
var shortid = _interopDefault(require("shortid"));
var wrtc = require("wrtc");

var CLIENT_MASTER = "MASTER";

var asyncToGenerator = function(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step("next", value);
            },
            function(err) {
              step("throw", err);
            }
          );
        }
      }

      return step("next");
    });
  };
};

var classCallCheck = function(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function(Constructor, protoProps, staticProps) {
    if (protoProps)
      defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

var Client = (function() {
  function Client(options) {
    classCallCheck(this, Client);
    var provider = options.provider;

    this._provider = provider;
  }

  createClass(Client, [
    {
      key: "connect",
      value: (function() {
        var _ref = asyncToGenerator(
          /*#__PURE__*/ _regeneratorRuntime.mark(function _callee() {
            var to =
              arguments.length > 0 && arguments[0] !== undefined
                ? arguments[0]
                : CLIENT_MASTER;
            var cid, connection;
            return _regeneratorRuntime.wrap(
              function _callee$(_context) {
                while (1) {
                  switch ((_context.prev = _context.next)) {
                    case 0:
                      // Create an id for this connection.
                      cid = shortid();
                      // Establish a UDP connection with the remote client.

                      _context.next = 3;
                      return this._provider.create(to, cid);

                    case 3:
                      connection = _context.sent;
                      return _context.abrupt("return", connection);

                    case 5:
                    case "end":
                      return _context.stop();
                  }
                }
              },
              _callee,
              this
            );
          })
        );

        function connect() {
          return _ref.apply(this, arguments);
        }

        return connect;
      })()
    }
  ]);
  return Client;
})();

var DataChannel = (function() {
  createClass(DataChannel, [
    {
      key: "id",
      get: function get$$1() {
        return this._dc.label;
      }
    }
  ]);

  function DataChannel(options) {
    var _this = this;

    classCallCheck(this, DataChannel);
    this._subscribers = [];

    this._onMessage = function(e) {
      var data = e.data;

      _this._subscribers.forEach(function(subscriber) {
        return subscriber(data);
      });
    };

    this.send = function(message) {
      _this._dc.send(message);
    };

    this.subscribe = function(subscriber) {
      _this._subscribers.push(subscriber);
    };

    this.unsubscribe = function(subscriber) {
      _this._subscribers.splice(
        _this._subscribers.indexOf(subscriber),
        1
      );
    };

    var dc = options.dc;

    this._dc = dc;

    dc.addEventListener("message", this._onMessage);
  }

  return DataChannel;
})();

var DATA_CHANNEL_OPTIONS = {
  ordered: true,
  reliable: false
};

var RTCPeer = (function() {
  function RTCPeer(options) {
    var _this = this;

    classCallCheck(this, RTCPeer);
    this._channels = {};
    this._initiator = false;

    this._onLocalSDP = function(sdp) {
      _this._pc.setLocalDescription(sdp);
      _this._onSDP(sdp);
    };

    this._onIceCandidate = function(e) {
      _this._onICE(e.candidate);
    };

    this._onDataChannel = function(e) {
      var dc = e.channel;

      var channel = _this._channels[dc.label];

      if (channel) {
        return;
      }

      channel = _this._channels[dc.label] = new DataChannel({
        dc: dc
      });

      _this._onChannel(channel);
    };

    var onChannel = options.onChannel,
      onICE = options.onICE,
      onSDP = options.onSDP,
      pc = options.pc;

    this._onICE = onICE;
    this._onSDP = onSDP;
    this._onChannel = onChannel;
    this._pc = pc;
    this._pc.addEventListener("datachannel", this._onDataChannel);
    this._pc.addEventListener("icecandidate", this._onIceCandidate);
  }

  createClass(RTCPeer, [
    {
      key: "channel",
      value: function channel(id) {
        var _this2 = this;

        // Create a RTCDataChannel with the id as the label.
        var dc = this._pc.createDataChannel(id, DATA_CHANNEL_OPTIONS);

        return new Promise(function(r) {
          var handle = function handle() {
            var channel = new DataChannel({ dc: dc });
            _this2._channels[id] = channel;
            r(channel);
            _this2._onChannel(channel);
            dc.removeEventListener("open", handle);
          };
          dc.addEventListener("open", handle);
        });
      }

      /**
       * Create an offer session description.
       */
    },
    {
      key: "offer",
      value: function offer() {
        this._pc.createOffer(this._onLocalSDP, console.error, null);
      }

      /**
       * Create an answer session description.
       */
    },
    {
      key: "answer",
      value: function answer() {
        this._pc.createAnswer(this._onLocalSDP, console.error, null);
      }
    },
    {
      key: "setRemoteDescription",

      /**
       * Handle remote session description generated by answer.
       */
      value: function setRemoteDescription(sdp) {
        this._pc.setRemoteDescription(sdp);
      }
    },
    {
      key: "addIceCandidate",
      value: function addIceCandidate(ice) {
        if (ice === null) {
          return;
        }
        this._pc.addIceCandidate(ice);
      }
    }
  ]);
  return RTCPeer;
})();

var STUN = {
  url: "stun:stun.l.google.com:19302"
};

var TURN = {
  url: "turn:homeo@turn.bistri.com:80",
  username: "homeo",
  credential: "homeo"
};

var RTC_PEER_CONNECTION_OPTIONS = {
  iceServers: [STUN, TURN]
};

var RTCConnectionProvider = (function() {
  function RTCConnectionProvider(options) {
    var _this = this;

    classCallCheck(this, RTCConnectionProvider);
    this._peers = {};

    this._onMessage = function(message) {
      switch (message.type) {
        // Route ICE candidates to peers.
        case "ICE": {
          var src = message.src,
            ice = message.payload.ice;

          if (typeof src !== "string") {
            return;
          }

          var peer = _this._peers[src];

          if (!peer) {
            throw new Error(
              "Received ICE candidate for unestablished peer"
            );
          }

          peer.addIceCandidate(ice);

          break;
        }
        // Route session descriptions to peers.
        case "OFFER":
        case "ANSWER": {
          var _src = message.src,
            sdp = message.payload.sdp;

          var _peer = _this._peers[_src] || _this._addPeer(_src);

          var description = void 0;

          try {
            description = new wrtc.RTCSessionDescription(sdp);
          } catch (e) {
            throw new Error("Invalid SDP");
          }

          _peer.setRemoteDescription(description);

          if (message.type === "OFFER") {
            _peer.answer();
          }

          break;
        }
        default:
          break;
      }
    };

    this._onSDP = function(sdp, pid) {
      var payload = { sdp: sdp };

      var message = void 0;

      if (sdp.type === "offer") {
        message = {
          type: "OFFER_CLIENT",
          pid: pid,
          payload: payload
        };
      } else {
        message = {
          type: "ANSWER_CLIENT",
          pid: pid,
          payload: payload
        };
      }

      _this._transport.send(message);
    };

    this._onICE = function(ice, pid) {
      _this._transport.send({
        type: "ICE_CLIENT",
        pid: pid,
        payload: {
          ice: ice
        }
      });
    };

    var transport = options.transport,
      onConnection = options.onConnection;

    this._transport = transport;
    this._onConnection = onConnection;

    this._transport.subscribe(this._onMessage);
  }

  /**
   * Establish a UDP connection with a remote peer.
   */

  createClass(RTCConnectionProvider, [
    {
      key: "create",
      value: (function() {
        var _ref = asyncToGenerator(
          /*#__PURE__*/ _regeneratorRuntime.mark(function _callee(
            pid,
            cid
          ) {
            var peer, channel;
            return _regeneratorRuntime.wrap(
              function _callee$(_context) {
                while (1) {
                  switch ((_context.prev = _context.next)) {
                    case 0:
                      console.log(
                        "Attempting to establish connection " +
                          cid +
                          " to peer " +
                          pid +
                          "."
                      );

                      peer = this._peers[pid] || this._addPeer(pid);
                      channel = peer.channel(cid);

                      peer.offer();

                      _context.next = 6;
                      return channel;

                    case 6:
                      return _context.abrupt("return", _context.sent);

                    case 7:
                    case "end":
                      return _context.stop();
                  }
                }
              },
              _callee,
              this
            );
          })
        );

        function create(_x, _x2) {
          return _ref.apply(this, arguments);
        }

        return create;
      })()

      /**
       * Handle a signaling message.
       */
    },
    {
      key: "_addPeer",
      value: function _addPeer(id) {
        var _this2 = this;

        if (this._peers[id]) {
          throw new Error(
            "RTCPeer with id " + id + " already exists."
          );
        }

        var peer = new RTCPeer({
          pc: new wrtc.RTCPeerConnection(RTC_PEER_CONNECTION_OPTIONS),
          onChannel: function onChannel(channel) {
            return _this2._onConnection(channel);
          },
          onSDP: function onSDP(sdp) {
            return _this2._onSDP(sdp, id);
          },
          onICE: function onICE(ice) {
            return _this2._onICE(ice, id);
          }
        });

        this._peers[id] = peer;

        return peer;
      }
    }
  ]);
  return RTCConnectionProvider;
})();

var LocalTransport = (function() {
  function LocalTransport() {
    var _this = this;

    classCallCheck(this, LocalTransport);
    this._subscribers = [];

    this.subscribe = function(handler) {
      if (_this._subscribers.indexOf(handler) > -1) {
        return;
      }

      _this._subscribers.push(handler);
    };

    this.unsubscribe = function(handler) {
      var i = _this._subscribers.indexOf(handler);

      if (i === -1) {
        return;
      }

      _this._subscribers.splice(i, 1);
    };

    this.send = function(message) {
      for (var i = 0; i < _this._subscribers.length; i++) {
        _this._subscribers[i](message);
      }
    };
  }

  createClass(LocalTransport, [
    {
      key: "bind",
      value: function bind(transport) {
        var left = this.send;
        var right = transport.send;

        // Route messages from right -> left
        this.send = right.bind(transport);
        // Route messages from left -> right
        transport.send = left.bind(this);

        return this;
      }
    }
  ]);
  return LocalTransport;
})();

var serialize = JSON.stringify;
var deserialize = JSON.parse;

var WebSocketTransport = (function() {
  function WebSocketTransport(socket) {
    var _this = this;

    classCallCheck(this, WebSocketTransport);
    this._buffer = [];
    this._subscribers = [];
    this._open = false;

    this._onMessage = function(e) {
      if (!e.data) {
        return;
      }

      var message = deserialize(e.data);

      for (var i = 0; i < _this._subscribers.length; i++) {
        _this._subscribers[i](message);
      }
    };

    this._onOpen = function() {
      _this._open = true;
      _this._flush();
    };

    this._socket = socket;
    if (socket.readyState === 1) {
      this._onOpen();
    } else {
      this._socket.addEventListener("open", this._onOpen);
    }
    this._socket.addEventListener("message", this._onMessage);
  }

  createClass(WebSocketTransport, [
    {
      key: "_flush",
      value: function _flush() {
        var message = void 0;

        while ((message = this._buffer.shift())) {
          this._socket.send(serialize(message));
        }
      }
    },
    {
      key: "subscribe",
      value: function subscribe(handler) {
        if (this._subscribers.indexOf(handler) > -1) {
          return;
        }
        this._subscribers.push(handler);
      }
    },
    {
      key: "unsubscribe",
      value: function unsubscribe(handler) {
        var i = this._subscribers.indexOf(handler);

        if (i === -1) {
          return;
        }

        this._subscribers.splice(i, 1);
      }
    },
    {
      key: "send",
      value: function send(message) {
        this._buffer.push(message);

        if (!this._open) {
          return;
        }

        this._flush();
      }
    }
  ]);
  return WebSocketTransport;
})();

var Broker = (function() {
  function Broker() {
    var _this = this;

    classCallCheck(this, Broker);
    this._transports = {};

    this._onMessage = function(message, src) {
      switch (message.type) {
        case "OFFER_CLIENT": {
          var payload = message.payload,
            pid = message.pid;

          if (!_this._transports[pid]) {
            throw new Error("Client " + pid + " not found.");
          }

          _this._transports[pid].send({
            type: "OFFER",
            src: src,
            payload: {
              sdp: payload.sdp
            }
          });
          break;
        }
        case "ANSWER_CLIENT": {
          var _payload = message.payload,
            _pid = message.pid;

          if (!_this._transports[_pid]) {
            throw new Error("Client " + _pid + " not found.");
          }

          _this._transports[_pid].send({
            type: "ANSWER",
            src: src,
            payload: {
              sdp: _payload.sdp
            }
          });
          break;
        }
        case "ICE_CLIENT": {
          var _payload2 = message.payload,
            _pid2 = message.pid;

          if (!_this._transports[_pid2]) {
            throw new Error("Client " + _pid2 + " not found.");
          }

          _this._transports[_pid2].send({
            type: "ICE",
            src: src,
            payload: {
              ice: _payload2.ice
            }
          });
          break;
        }
        default:
          throw new Error(
            "Invalid message type " + message.type + "."
          );
      }
    };
  }

  createClass(Broker, [
    {
      key: "register",
      value: function register(transport) {
        var _this2 = this;

        var id =
          arguments.length > 1 && arguments[1] !== undefined
            ? arguments[1]
            : shortid();

        this._transports[id] = transport;
        transport.subscribe(function(message) {
          return _this2._onMessage(message, id);
        });
        return id;
      }
    }
  ]);
  return Broker;
})();

var left = new LocalTransport();
var right = new LocalTransport().bind(left);

var broker = new Broker();
var master = new Client({
  provider: new RTCConnectionProvider({
    onConnection: function onConnection(connection) {
      var send = connection.send,
        subscribe = connection.subscribe;

      subscribe(function(message) {
        if (message === "PING") {
          send("PONG");
        }
      });
    },
    transport: right
  })
});

// Route messages to/from master client.
broker.register(left, CLIENT_MASTER);

var port = process.env.PORT || 4000;
var server = new ws.Server({ port: port });

// Route signaling messages to/from peers.
server.on("connection", function(ws$$1) {
  console.log("User connected to signaling server.");
  broker.register(new WebSocketTransport(ws$$1));
});

console.log("Signaling server listening on port " + port);
