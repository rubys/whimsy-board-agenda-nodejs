#!/usr/bin/env node
//
// An Operating System and shell in dependent launcher of the
// client (webpack DevServer) and server running in development mode.
//
// As a bonus, runs 'yarn install' to ensure that dependencies are current.
//

const fs = require('fs')
const path = require('path')
const child_process = require('child_process')

const root = path.resolve(__dirname, '..');

process.chdir(root);

child_process.execSync('yarn install', { stdio: 'inherit' });

child_process.execSync('concurrently --kill-others-on-fail yarn:server yarn:client', { 
  env: {
    NODE_ENV: 'development',
    PATH: `${path.join(root, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH}`,
  },
  stdio: 'inherit' 
});
