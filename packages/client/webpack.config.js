const path = require("path")

module.exports = {
  output: {
    path: path.resolve("dist"),
    filename: "index.js",
    library: "Udp",
    libraryTarget: "umd",
  },
  node: {
    crypto: "empty",
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
