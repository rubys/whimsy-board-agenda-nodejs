const fs = require('fs')
const path = require('path')
const child_process = require('child_process')

process.chdir(path.resolve(__dirname, '..'));

let mtime = fs.statSync('yarn.lock').mtimeMs;

child_process.execSync('git pull', { stdio: 'inherit' });

if (mtime !== fs.statSync('yarn.lock').mtimeMs) {
  child_process.execSync('yarn install', { stdio: 'inherit' });
}

for (let arg of process.argv.slice(2)) {
  child_process.execSync(`yarn ${arg}`, { stdio: 'inherit' });
}
