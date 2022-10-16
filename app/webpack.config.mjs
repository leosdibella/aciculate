import * as path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TsconfigPathsPluginPkg from 'tsconfig-paths-webpack-plugin';
const { TsconfigPathsPlugin } = TsconfigPathsPluginPkg;
import webpack from 'webpack';
import { readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultApiOrigin = 'http://localhost:8080';
const defaultApiOriginSsl = 'https://localhost:8081';
const defaultAppPort = 8082;
const defaultAppPortSsl = 8083;
const defaultSslKeyFilePath = './key.pem';
const defaultSslCertFilePath = './cert.pem';

export default (env = {}) => {
  const useSsl = (process.env.ACICULATE_USE_SSL ?? env.useSsl ?? 'false').toLowerCase() === 'true';

  const appPort = useSsl
    ? process.env.ACICULATE_APP_PORT_SSL ?? defaultAppPortSsl
    : process.env.ACICULATE_APP_PORT ?? defaultAppPort;

  const apiOrigin = useSsl
    ? process.env.ACICULATE_API_ORIGIN_SSL ?? defaultApiOriginSsl
    : process.env.ACICULATE_API_ORIGIN ?? defaultApiOrigin

  const key = useSsl ? readFileSync(
    path.resolve(__dirname, process.env.ACICULATE_APP_SSL_KEY_FILEPATH ?? defaultSslKeyFilePath)
  ) : undefined;

  const cert = useSsl ? readFileSync(
    path.resolve(__dirname, process.env.ACICULATE_APP_SSL_CERT_FILEPATH ?? defaultSslCertFilePath)
  ) : undefined;

  const server = {
    type: useSsl ? 'https' : 'http',
    options: useSsl ? {
      minVersion: 'TLSv1.1',
      key,
      cert
    } : undefined
  }

  return {
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
        ACICULATE_API_ORIGIN: JSON.stringify(apiOrigin)
      })
    ],
    devServer: {
      hot: true,
      port: appPort,
      server,
      static: {
        directory: path.resolve(__dirname, './dist')
      },
      devMiddleware: {
        index: true,
        mimeTypes: {
          phtml: 'text/html'
        },
        publicPath: './dist',
        writeToDisk: true
      }
    }
  }
};
