const { CheckerPlugin } = require('awesome-typescript-loader');
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
  // https://webpack.js.org/concepts/targets/
  target: 'web',
  mode: process.env.NODE_ENV,
  devtool: false,
  entry: {
    contentscript: path.join(__dirname, 'src/contentscript/contentscript.tsx'),
    background: path.join(__dirname, 'src/background/background.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        use: 'awesome-typescript-loader?{configFileName: "tsconfig.json"}',
      },
      // https://webpack.js.org/guides/typescript/
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    // new CheckerPlugin(),
    ...plugins,
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    // https://stackoverflow.com/questions/37656592/define-global-variable-with-webpack
    // https://webpack.js.org/plugins/define-plugin/#usage
    new DefinePlugin({
      'process.platform': JSON.stringify('win32'),
      'process.env.TERM': JSON.stringify(''),
    })
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    // https://webpack.js.org/configuration/resolve/#resolvefallback
    fallback: {
      crypto: false,
      fs: false,
    }
  },
};