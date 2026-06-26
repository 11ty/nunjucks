#!/usr/bin/env node

'use strict';

// The library source (nunjucks/) is CommonJS at ES2017 syntax, which every
// supported Node version (>= 20) runs natively, so the published Node build is
// just a copy of the source — no transpilation required. This produces the
// root index.js + src/ that package.json's `main` and `files` point at.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sourceDir = path.join(root, 'nunjucks');

fs.copyFileSync(path.join(sourceDir, 'index.js'), path.join(root, 'index.js'));

const destSrc = path.join(root, 'src');
fs.rmSync(destSrc, { recursive: true, force: true });
fs.cpSync(path.join(sourceDir, 'src'), destSrc, { recursive: true });

console.log('Copied nunjucks/ -> index.js + src/'); // eslint-disable-line no-console
