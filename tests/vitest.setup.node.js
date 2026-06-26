'use strict';

// The old Mocha runner ran with `NODE_PATH=tests/test-node-pkgs` so that the
// NodeResolveLoader tests can `require.resolve('dummy-pkg/...')`. Restore that
// search path for the Node test project.
const path = require('path');
const Module = require('module');

const pkgsDir = path.resolve(__dirname, 'test-node-pkgs');
process.env.NODE_PATH = process.env.NODE_PATH
  ? process.env.NODE_PATH + path.delimiter + pkgsDir
  : pkgsDir;
Module._initPaths();
