const globby = require("globby");
const path = require("path");
const fs = require("fs-extra");
const Babel = require("@babel/core");

module.exports = async (src, dest, options = { babel: Babel.loadOptions() }) => {
  src = path.resolve(src);
  dest = path.resolve(dest);

  const _transform = file =>
    transform(file, src, dest, {
      filename: file,
      ...options
    });

  const files = await globby("**/*.js", {
    cwd: src
  });

  return Promise.all(files.map(_transform));
}

async function transform (file, src, dest, { babel, onFile } = {}) {
  const filePath = path.join(src, file)
  const content = await fs.readFile(filePath)
  const destPath = path.join(dest, file)

  const { code } = Babel.transform(content.toString(), babel);

  await fs.outputFile(destPath, code);

  if (typeof onFile === "function") {
    onFile(file);
  }
}
