#!/usr/bin/env node

const fs = require('fs');

const value = process.env.CI ?? process.env.VERCEL ?? '';
const isCI =
  (typeof value === 'string' && value.length > 0 && value !== '0') ||
  process.env.HUSKY === '0';

if (isCI || !fs.existsSync('.git')) {
  process.exit(0);
}

try {
  require('husky').install();
} catch (error) {
  if (error?.code === 'MODULE_NOT_FOUND') {
    console.warn('[prepare-husky] husky is not installed; skipping install.');
    process.exit(0);
  }

  console.warn('[prepare-husky] failed to run husky install. Skipping.', error);
  process.exit(0);
}
