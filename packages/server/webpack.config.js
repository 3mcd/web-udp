const path = require("path")
const externals = require("webpack-node-externals")

module.exports = {
  target: "node",
  externals: [externals({
    modulesFromFile: true,
  })],
  output: {
    path: path.resolve("lib"),
    filename: "index.js",
    library: "Udp",
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
