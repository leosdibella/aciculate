import * as path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TsconfigPathsPluginPkg from 'tsconfig-paths-webpack-plugin';
const { TsconfigPathsPlugin } = TsconfigPathsPluginPkg;
import webpack from 'webpack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (env = {}) => ({
  node: {
    __dirname: true
  },
  watch: env.isProduction ? false : !!env.shouldWatch,
  watchOptions: {
    ignored: /node_modules/
  },
  mode: env.isProduction ? 'production' : 'development',
  devtool: 'source-map',
  entry: path.resolve(__dirname, './src/index.ts'),
  output: {
    filename: env.isProduction ? '[name].[contenthash].js' : '[hash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    clean: true
  },
  experiments: {
    asyncWebAssembly: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: !!env.noTypeCheck,
          onlyCompileBundledFiles: true
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: false
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {},
    plugins: [
      new TsconfigPathsPlugin()
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new webpack.DefinePlugin({
      ACICULATE_API_ORIGIN: JSON.stringify(process.env.ACICULATE_API_ORIGIN)
    })
  ],
  devServer: {
    hot: true,
    port: +(process.env.ACICULATE_APP_PORT || 8081),
    static: {
      directory: path.resolve(__dirname, './dist')
    },
    devMiddleware: {
      index: true,
      mimeTypes: {
        phtml: 'text/html'
      },
      publicPath: './dist',
      writeToDisk: true,
    }
  }
});