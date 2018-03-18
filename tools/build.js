const path = require("path");

const build = async (name, dir) => {
  console.log(`Building package ${name}.`);

  await Promise.all([
    require("./build-babel")(dir).then(() =>
      console.log(" Transpiled and distributed source.")
    ),
    require("./build-types")(dir).then(() =>
      console.log(" Distributed types.")
    ),
    require("./build-webpack")(dir).then(() =>
      console.log(" Created Webpack bundle.")
    )
  ]).catch(console.log);

  console.log(`Finished building package ${name}.`);
};

build(require(path.resolve("package.json")).name, process.cwd());
