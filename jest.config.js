// jest.config.js
module.exports = {
  "collectCoverageFrom": [
    "!<rootDir>/node_modules/",
    "!<rootDir>/test/",
    "src/**/*.{ts}"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testMatch": [
    "**/__tests__/**/*.ts?(x)",
    "<rootDir>/packages/**/?(*.)(spec|test).ts?(x)"
  ],
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json"
  ],
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  "testURL": "http://localhost"
};
