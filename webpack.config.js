module.exports = {
  target: "webworker",
  entry: "./index.js",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: require.resolve('@open-wc/webpack-import-meta-loader'),
      },
    ],
  },
};
