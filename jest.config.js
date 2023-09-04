module.exports = {
  preset: "solid-jest/preset/node",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
      babelConfig: {
        presets: ["babel-preset-solid", "@babel/preset-env"],
      },
    },
  },
  // insert setupFiles and other config
  // you probably want to test in browser mode:
  testEnvironment: "jsdom",
  // unfortunately, solid cannot detect browser mode here,
  // so we need to manually point it to the right versions:
  moduleNameMapper: {
    "solid-js/web": "<rootDir>/node_modules/solid-js/web/dist/web.cjs",
    "solid-js": "<rootDir>/node_modules/solid-js/dist/solid.cjs",
    ".*\\.(scss|css|jpe?g|png|svg)$": "<rootDir>/.empty.js",
  },
  setupFilesAfterEnv: [
    "<rootDir>/node_modules/@testing-library/jest-dom/extend-expect",
  ],
  transform: {
    "\\.[jt]s$": "babel-jest",
  },
};
