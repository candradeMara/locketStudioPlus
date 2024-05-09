module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    parser: "@babel/eslint-parser",
    requireConfigFile: false,
    babelOptions: {
      babelrc: false,
      configFile: false,
      // your babel options
      // presets: ["@babel/preset-env"],
    },
    ecmaVersion: "2021",
    sourceType: "module",
    ecmaFeatures: {
      modules: true,
    },
    allowImportExportEverywhere: true,
  },
  rules: {
    quotes: ["error", "double"],
    indent: ["error", 2],
    "prefer-promise-reject-errors": "off",
    "no-async-promise-executor": "off",
    "no-unused-vars": "off",
  },
};
