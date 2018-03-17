const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");

const common = require("../../../build/webpack.config");

module.exports = merge(common, {
  entry: "./src/index",
  target: "node",
  output: {
    path: path.resolve("dist"),
    filename: "index.js",
    library: "UdpProtocol",
    libraryTarget: "umd"
  }
});
