const webpack = require("webpack");
const FlowWebpackPlugin = require("flow-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  context: process.cwd(),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!@web-udp)/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new FlowWebpackPlugin()
    // new BundleAnalyzerPlugin({
    //   analyzerMode: "static"
    // })
  ]
};
