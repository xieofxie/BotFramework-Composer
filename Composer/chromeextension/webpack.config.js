const { CheckerPlugin } = require('awesome-typescript-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { optimize, DefinePlugin } = require('webpack');
const { join } = require('path');
let prodPlugins = [];
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push(
    //new optimize.AggressiveMergingPlugin(),
    // TODO
    //new optimize.OccurrenceOrderPlugin()
  );
}
module.exports = {
  // https://webpack.js.org/concepts/targets/
  target: 'web',
  mode: process.env.NODE_ENV,
  devtool: 'inline-source-map',
  entry: {
    contentscript: join(__dirname, 'src/contentscript/contentscript.tsx'),
    background: join(__dirname, 'src/background/background.ts'),
  },
  output: {
    path: join(__dirname, 'dist'),
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
    ...prodPlugins,
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    // https://stackoverflow.com/questions/37656592/define-global-variable-with-webpack
    // https://webpack.js.org/plugins/define-plugin/#usage
    new DefinePlugin({
      'process.platform': 'win32'
    })
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    // https://webpack.js.org/configuration/resolve/#resolvefallback
    fallback: {
      crypto: false,
      fs: false
    }
  },
};