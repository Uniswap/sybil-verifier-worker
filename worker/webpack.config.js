const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    bundle: path.join(__dirname, './src/index.js'),
  },

  output: {
    filename: 'worker.js',
    path: path.join(__dirname),
  },

  resolve: {
    fallback: { 
      "stream": require.resolve("stream-browserify") 
    }
  },
  plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
  ]
}