const path = require("path")
const babelTransformDir = require("./babel-transform-dir")

module.exports = async dir =>
  babelTransformDir(path.join(dir, "src"), path.join(dir, "lib"), {
    babel: require("../.babelrc"),
  })
