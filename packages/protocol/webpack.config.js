const path = require("path")

module.exports = {
  target: "node",
  output: {
    path: path.resolve("lib"),
    filename: "index.js",
    library: "UdpProtocol",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              rootMode: "upward",
            },
          }
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
}
