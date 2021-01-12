const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { optimize, DefinePlugin, SourceMapDevToolPlugin } = require('webpack');
const path = require('path');

let plugins = [];
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new optimize.AggressiveMergingPlugin(),
  );
} else {
  plugins.push(
    // https://webpack.js.org/plugins/source-map-dev-tool-plugin/#basic-use-case
    new SourceMapDevToolPlugin({}),
  );
}

module.exports = {
  target: 'web',
  mode: process.env.NODE_ENV,
  devtool: false,
  entry: {
    popup: './src/popup/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/]
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    ...plugins,
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
};
