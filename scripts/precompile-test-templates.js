#!/usr/bin/env node

'use strict';

// Generates tests/browser/precompiled-templates.js, used by the Vitest
// browser-slim project (the slim build can only render precompiled templates).
const precompileTestTemplates = require('./lib/precompile');

precompileTestTemplates()
  .then(() => {
    console.log('Precompiled test templates -> tests/browser/precompiled-templates.js'); // eslint-disable-line no-console
  })
  .catch((err) => {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  });
