var mochaPhantom = require('./mocha-phantomjs');
var spawn = require('cross-spawn');
var getStaticServer = require('./static-server');
var path = require('path');

var utils = require('./utils');
var lookup = utils.lookup;
var promiseSequence = utils.promiseSequence;

function mochaRun() {
  const bin = lookup('.bin/nyc', true);
  const runArgs = [
    '--require', '@babel/register',
    '--exclude',
    'tests/**',
    '--silent',
    '--no-clean',
    require.resolve('mocha/bin/mocha'),
  ];

  const mochaArgs = ['--grep', 'precompile cli', '--invert', 'tests'];

  return new Promise((resolve, reject) => {
    try {
      const proc = spawn(bin, [
        ...runArgs,
        '-R', 'spec',
        '-r', 'tests/setup',
        '-r', '@babel/register',
        ...mochaArgs,
      ], {
        cwd: path.join(__dirname, '../..'),
        env: process.env,
        stdio: 'inherit',
      });

      proc.on('error', (err) => reject(err));

      proc.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('test failed. nyc/mocha exit code: ' + code));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

function runtests() {
  return new Promise((resolve, reject) => {
    var server;

    const mochaPromise = promiseSequence([
      () => mochaRun(),
    ]);

    mochaPromise.then(() => {
      return getStaticServer().then((args) => {
        server = args[0];
        const port = args[1];
        const promises = ['index', 'slim'].map(
          f => (() => mochaPhantom(`http://localhost:${port}/tests/browser/${f}.html`)));
        return promiseSequence(promises).then(() => {
          server.close();
          resolve();
        });
      });
    }).catch((err) => {
      if (server) {
        server.close();
      }
      reject(err);
    });
  });
}

module.exports = runtests;
