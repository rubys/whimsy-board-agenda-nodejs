import credentials from './credentials.js';
import { rootPath } from './config.js';
import tmp from 'tmp-promise';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jwt-simple';
import crypto from 'crypto';
import child_process from 'child_process';
import path from 'path';

// git accepts http[s] credentials in the URL (which is likely
// to leak in logs), or via a GIT_ASKPASS program.  Such programs
// accept no arguments, but can access environment variables.
// In error cases, the program itself could be left behind.
// It is difficult, but possible, for people with root access
// to capture environment variables.
//
// Given these constraints, the implementation below encodes
// the password in a node.js script, and passes the secret
// in an environment variable.  One would have to capture
// both in order to decrypt a password.
//
// On Linux and MacOS, the node script can be the GIT_ASKPASS
// executable.  On Windows, the executable must be something
// launchabble, generally a .exe, .cmd, or .bat file.
//
// .bat files can launch node scripts, so on Windows, two
// temporary files are created.  An additional issue:
// .bat files placed in tmp directory are blocked from
// running for security reasons.  For this reason, the
// generated .bat files are placed in the %APPDATA%
// directory.
async function withCredentials(request, callback) {
  let { username, password } = credentials(request);
  let SECRET = crypto.randomBytes(16).toString('hex');
  let script = `
    #!${process.execPath}
    const jwt = require('jwt-simple');
    let token = ${JSON.stringify(jwt.encode(password, SECRET))};
    console.log(${JSON.stringify(username)});
    console.log(jwt.decode(token, process.env.SECRET));
  `.replace(/^\s+/, '');

  const { path, cleanup } = await tmp.file({ mode: 0o700 });

  try {
    await fs.writeFile(path, script);

    if (process.platform === 'win32') {
      let tmpDir = `${process.env.APPDATA}\\whimsy`;
      await fs.mkdir(tmpDir, { recursive: true });
      let batfile = `${tmpDir}\\${path.basename(script)}.bat`;
      try {
        await fs.writeFile(batfile, `@ECHO OFF\r\n"${process.execPath}" ${path}\r\n`);
        await callback({ GIT_ASKPASS: batfile, SECRET });
      } finally {
        await fs.unlink(batfile).catch(() => {});
      }
    } else {
      await callback({ GIT_ASKPASS: path, SECRET });
    }
  } finally {
    cleanup();
  }
}

// execute an authenticated git command, providing the GIT_ASKPASS and
// SECRET provided by the withCredentials function.
async function gitcmd({ GIT_ASKPASS, SECRET }, args) {
  return await new Promise((resolve, reject) => {
    let NODE_PATH = `${rootPath}${path.sep}node_modules`;
    child_process.exec(`git ${args}`, 
      { env: { ...process.env, NODE_PATH, GIT_ASKPASS, SECRET } },
      (error, stdout, stderr) => {
        if (error) reject(error);
        resolve(stdout + stderr);
      }
    )
  });
};

// TODO: extract the common logic out of the SVN Repoitory class into
// a common base class.