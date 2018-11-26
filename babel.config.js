module.exports = api => {
  if (api) {
    api.cache(true);
  }

  return {
    presets: [
      "@babel/preset-typescript",
      [
        "@babel/preset-env",
        {
          targets: {
            browsers: ["last 2 versions"]
          },
          modules: false
        }
      ]
    ],
    plugins: [
      "@babel/plugin-transform-modules-commonjs",
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread",
      ["@babel/plugin-transform-runtime", { helpers: false }]
    ]
  };
};
