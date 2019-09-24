const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = env => {
  return {
    entry: './index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    target: 'node', // in order too ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    }
  };
};