const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");

const input = {
  input: "src/server/index.js",
  plugins: [
    resolve({
      modulesOnly: true,
      preferBuiltins: true
    }),
    babel({
      exclude: "node_modules/**",
      runtimeHelpers: true
    })
  ]
};

const output = {
  file: "lib/server.js",
  format: "cjs"
};

function build() {
  return rollup.rollup(input).then(bundle => bundle.write(output));
}

build();
