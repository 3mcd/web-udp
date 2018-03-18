const path = require("path");
const webpack = require("webpack");

const options = {
  colors: true
};

const optionsError = {
  colors: true,
  hash: false,
  version: false,
  timings: false,
  assets: false,
  chunks: false,
  chunkModules: false,
  modules: false,
  children: false,
  cached: false,
  reasons: false,
  source: false,
  errorDetails: true,
  chunkOrigins: false
};

module.exports = async dir => {
  const config = require(path.join(dir, "build/webpack.config"));

  const build = config => {
    return new Promise((resolve, reject) => {
      webpack(
        Object.assign({ mode: "production" }, config),
        (err, stats) => {
          if (err) {
            reject(err);
          }

          if (stats.hasErrors()) {
            reject(stats.toString(optionsError));
          }

          resolve(stats);
        }
      );
    });
  };

  let stats = await (Array.isArray(config)
    ? Promise.all(config.map(build))
    : build(config));

  return stats;
};
