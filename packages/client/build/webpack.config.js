const path = require("path");
const merge = require("webpack-merge");
const externals = require("webpack-node-externals");

const common = require("../../../tools/webpack.config");

module.exports = merge(common, {
  entry: "./src/index",
  output: {
    path: path.resolve("dist"),
    filename: "index.browser.js",
    library: "Udp",
    libraryTarget: "umd"
  },
  node: {
    crypto: "empty"
  }
});
