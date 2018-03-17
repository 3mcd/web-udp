const path = require("path");
const externals = require("webpack-node-externals");
const merge = require("webpack-merge");
const common = require("../../../build/webpack.config");

module.exports = merge(common, {
  target: "node",
  externals: [
    externals()
  ],
  entry: "./src/index",
  output: {
    path: path.resolve("lib"),
    filename: "index.js",
    library: "Udp",
    libraryTarget: "umd"
  }
});
