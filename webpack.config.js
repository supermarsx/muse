//const { performServerHandshake } = require('http2');
const path = require('path');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const defaultRoutine = {
  scripts: ['node build.generate-master-file.js'],
  blocking: true
};

module.exports = {
  //entry: glob.sync('source/*.ts'),
  //entry: entryFiles,
  entry: './source/master.ts',
  plugins: [
    new WebpackShellPluginNext({
      onBuildStart: defaultRoutine
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }

    ],
  },
  resolve: {
    preferRelative: true,
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    iife: false,
    clean: true,
    filename: '_muse.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    scriptType: 'text/javascript',
    library: {
      name: '_muse',
      type: 'assign'
    }
  },
  optimization: {
    usedExports: true,
  },
  mode: 'development',
  watch: true,
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000,
  },
  devServer: {
    client: {
      overlay: false,
      reconnect: false,
      webSocketURL: 'http://localhost:8000'
    },
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    compress: false,
    port: 8000
  }
};
