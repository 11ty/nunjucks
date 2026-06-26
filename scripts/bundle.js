#!/usr/bin/env node
/* eslint-disable vars-on-top, func-names */

'use strict';

var path = require('path');
var webpack = require('webpack');
var pjson = require('../package.json');
var TEST_ENV = (process.env.NODE_ENV === 'test');

var destDir = path.resolve(path.join(
  __dirname,
  (TEST_ENV) ? '../tests/browser' : '../browser'));

function runWebpack() {
  return new Promise(function(resolve, reject) {
    try {
      var config = {
        entry: './nunjucks/index.js',
        devtool: 'source-map',
        mode: TEST_ENV ? 'none' : 'production',
        target: ['web', 'es5'],
        output: {
          path: destDir,
          filename: 'nunjucks.js',
          library: 'nunjucks',
          libraryTarget: 'umd',
          devtoolModuleFilenameTemplate: function(info) {
            return path.relative(destDir, info.absoluteResourcePath);
          }
        },
        module: {
          rules: [{
            test: /nunjucks/,
            exclude: /(node_modules|browser|tests)(?!\.js)/,
            use: {
              loader: 'babel-loader',
              options: {
                plugins: [['module-resolver', {
                  extensions: ['.js'],
                  resolvePath: function(sourcePath) {
                    if (sourcePath.match(/^(fs|path|chokidar)$/)) {
                      return 'node-libs-browser/mock/empty';
                    }
                    if (sourcePath.match(/\/loaders(\.js)?$/)) {
                      return sourcePath.replace('loaders', 'web-loaders');
                    }
                    return null;
                  },
                }]]
              }
            }
          }]
        },
        plugins: [
          new webpack.BannerPlugin(
            'Browser bundle of nunjucks ' + pjson.version
          ),
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
          }),
        ]
      };

      webpack(config).run(function(err, stats) {
        if (err) {
          reject(err);
        } else {
          resolve(stats.toString({cached: false, cachedAssets: false}));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

runWebpack()
  .then(function(stats) {
    console.log(stats); // eslint-disable-line no-console
  })
  .catch(function(err) {
    throw err;
  });
