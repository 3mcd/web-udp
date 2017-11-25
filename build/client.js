const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const cjs = require("rollup-plugin-commonjs");

const input = {
  input: "src/client/index.js",
  plugins: [
    resolve({
      browser: "true"
    }),
    babel({
      exclude: "node_modules/**"
    }),
    cjs()
  ]
};

const output = {
  file: "dist/client.js",
  format: "umd",
  name: "Udp",
  sourceMap: true
};

function build() {
  return rollup.rollup(input).then(bundle => bundle.write(output));
}

build();
