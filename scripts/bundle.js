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
        // The source is ES2017 CommonJS; no transpilation step is needed.
        target: ['web', 'es2017'],
        output: {
          path: destDir,
          filename: 'nunjucks.js',
          library: 'nunjucks',
          libraryTarget: 'umd',
          devtoolModuleFilenameTemplate: function(info) {
            return path.relative(destDir, info.absoluteResourcePath);
          }
        },
        resolve: {
          // The Node-only loaders are swapped out below, so the filesystem
          // modules they referenced are stubbed to empty in the browser build.
          fallback: {
            fs: false,
            path: false,
          },
        },
        plugins: [
          // `./loaders` re-exports the Node filesystem loaders; swap it for the
          // browser (web) loaders. (loaders.js itself documents this rewrite.)
          new webpack.NormalModuleReplacementPlugin(/\/loaders$/, function(resource) {
            resource.request = resource.request.replace(/\/loaders$/, '/web-loaders');
          }),
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
