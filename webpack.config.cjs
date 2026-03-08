const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

/** Userscript metadata banner inserted at the top of the global bundle. */
const userscriptBanner = `// ==UserScript==
// @name         ${pkg.name}
// @namespace    ${pkg.homepage}
// @version      ${pkg.version}
// @description  ${pkg.description}
// @author       ${pkg.author}
// @license      ${pkg.license}
// ==/UserScript==
`;

/**
 * Creates a webpack config for the global IIFE/assign bundle.
 *
 * @param {{ minified?: boolean }} options
 * @returns {import('webpack').Configuration}
 */
function createConfig({ minified = false } = {}) {
  return {
    entry: './source/index.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: false,
                declarationMap: false,
                sourceMap: false,
              },
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      preferRelative: true,
      extensions: ['.tsx', '.ts', '.js'],
      modules: [path.resolve(__dirname, 'source'), 'node_modules'],
    },
    output: {
      iife: false,
      clean: !minified, // Only the first config cleans
      filename: minified ? '_muse.min.js' : '_muse.js',
      path: path.resolve(__dirname, 'dist', 'global'),
      publicPath: '',
      scriptType: 'text/javascript',
      library: {
        name: '_muse',
        type: 'assign',
      },
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: userscriptBanner,
        raw: true,
      }),
      new webpack.DefinePlugin({
        __MUSE_VERSION__: JSON.stringify(pkg.version),
      }),
    ],
    optimization: {
      usedExports: true,
      minimize: minified,
      ...(minified && {
        minimizer: [
          new TerserPlugin({
            extractComments: false,
            terserOptions: {
              format: {
                // Strip all comments; preamble re-adds the userscript header after minification
                comments: false,
                preamble: userscriptBanner,
              },
            },
          }),
        ],
      }),
    },
    mode: minified ? 'production' : 'development',
    devtool: minified ? false : 'source-map',
  };
}

// Dev server config (unminified only)
const devConfig = {
  ...createConfig({ minified: false }),
  devServer: {
    client: {
      overlay: false,
      reconnect: false,
      webSocketURL: 'http://localhost:8000',
    },
    static: {
      directory: path.resolve(__dirname, 'dist', 'global'),
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
    compress: false,
    port: 8000,
  },
};

// Export array for dual build, single config for dev server
module.exports = (env, argv) => {
  if (argv.mode === 'development' || process.env.WEBPACK_SERVE) {
    return devConfig;
  }
  // Dual build: unminified + minified
  return [
    createConfig({ minified: false }),
    createConfig({ minified: true }),
  ];
};
