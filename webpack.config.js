'use strict';

// Load
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const {CheckerPlugin} = require('awesome-typescript-loader');

const tsconfig = 'tsconfig.json';

const plugins = [];

// common
plugins.push(
  new CheckerPlugin(),
  new HtmlWebpackPlugin({
    title: pkg.name,
    template: 'testplayer/index.html',
    filename: './index.html'
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor', // Specify the common bundle's name.
    minChunks: Infinity
  }),
  new ExtractTextPlugin({
    filename: 'static/css/bundle.css',
    disable: false,
    allChunks: true
  }),
  new SpriteLoaderPlugin()
);

// production
if (mode === 'production') {
  //sets the value for production for other modules to use.
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    // Cleans up the dist folder before building new build
    new CleanWebpackPlugin(['tmp'], {
      root: __dirname,
      verbose: true,
      dry: false,
      exclude: ['node_modules/*']
    }),
    // minify js
    new BabiliPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    // minifies css
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: {
        discardComments: {
          removeAll: true,
        },
        // Run cssnano in safe mode to avoid
        // potentially unsafe transformations.
        safe: true,
      },
      canPrint: false,
    })
  );
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    vendor: ['react', 'react-dom'],
    testplayer: ['./testplayer/app.tsx']
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'static/js/[name].bundle.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'src'),
    host: '0.0.0.0',
    port: 8100,
    hot: true,
    inline: true,
    disableHostCheck: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  },
  devtool: "source-map",
  node: {
    fs: 'empty'
  },
  plugins: plugins,
  module: {
    rules: [{
        test: /\.ts(x?)$/,
        exclude: /node_modules|vendor/,
        use: [{
          loader: 'awesome-typescript-loader',
          options: {
            configFileName: tsconfig,
            useBabel: true,
            babelOptions: {
              presets: ['env', 'react']
            },
            useCache: true
          }
        }]
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['env', 'react']
          }
        }]
      }, {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract([{
          loader: 'css-loader',
          options: {
            sourceMap: true,
            modules: true,
            importLoaders: 1,
            localIdentName: '[path]___[local]___[hash:base64:5]',
            getLocalIdent: getlocalIdent
          }
        }, {
          loader: 'resolve-url-loader',
          options: {
            sourceMap: true
          }
        }, {
          loader: 'postcss-loader',
          options: {
            sourceMap: true
          }
        }, {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        }])
      }, {
        test: /\.(jpe?g|png|gif|mp3|wav|woff2?|eot|ttf)(\?.*$|$)/,
        loader: "url-loader",
        options: {
          name: "static/images/[name][hash:6]"
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.svg'],
    plugins: [
      new TsConfigPathsPlugin(tsconfig)
    ],
    modules: [
      path.resolve('./node_modules')
    ]
  }
};
