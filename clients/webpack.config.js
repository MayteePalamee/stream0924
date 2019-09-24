const path = require('path');
var webpack = require('webpack')

module.exports = env => {
  return {
    entry: './src/app.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'public')
    },
    mode: 'development',
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
            },
        ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
      })
  ],
  };
};