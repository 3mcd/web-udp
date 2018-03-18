const path = require("path");
const flowCopySource = require("flow-copy-source");

const sources = [path.resolve("./src")];
const dest = path.resolve("./lib");

module.exports = async dir =>
  flowCopySource(
    [
      path.join(dir, "src")
    ],
    path.join(dir, "lib"),
    {
      ignore: "**/*.spec.js"
    }
  );
