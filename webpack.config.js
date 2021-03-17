const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
    entry: {
        bundle: path.join(__dirname, './js/index.js'),
    },

    mode: 'production',

    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },

    output: {
        filename: 'worker.js',
        path: path.join(__dirname, './worker'),
    },

    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ],

    resolve: {
        fallback: {
            stream: require.resolve('stream-browserify'),
        },
    },
}
