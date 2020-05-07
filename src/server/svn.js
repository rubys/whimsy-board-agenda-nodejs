import credentials from './credentials.js';
import shellEscape from "shell-escape";
import fs, { promises as fsp } from 'fs';
import { Mutex } from 'async-mutex';
import { workPath } from './config.js';
import { broadcast } from './websocket.js';
import * as Actions from '../actions.js';
import path from 'path';
import util from 'util';
import child_process from 'child_process';
import rimraf from 'rimraf';

const exec = util.promisify(child_process.exec);

const svnPath = `${workPath}/svn`;

const boardDir = `${svnPath}/foundation_board`;
const boardUrl = 'https://svn.apache.org/repos/private/foundation/board';

const minutesDir = `${svnPath}/minutes`;
const minutesUrl = 'https://svn.apache.org/repos/asf/infrastructure/site/trunk/content/foundation/records/minutes';

const committersDir = `${svnPath}/board`;
const committersUrl = 'https://svn.apache.org/repos/private/committers/board';

let repoPath = `${workPath}/repo`;

// new versions of svn support --password-from-stdin, and advertise such
// when you pass a -v option on help.  Old versions of svn don't support
// a -v option on help.  Assume --password-from-stdin is supported only
// if the help command succeed and the option is mentioned in the output. 
let _stdinPwdOK;
async function stdinPwdOK() {
  if (_stdinPwdOK === undefined) {
    try {
      let { stdout, stderr } = await exec('svn help checkout -v');
      _stdinPwdOK = stdout.includes('--password-from-stdin');
    } catch {
      _stdinPwdOK = false;
    }
  }

  return _stdinPwdOK;
}

// run an authenticated subversion command
async function svncmd(request, args) {
  let svn = 'svn';
  if (typeof args === 'string') args = args.split(' ');
  let { username, password } = credentials(request);
  let stdin;

  if (password) {
    if (await stdinPwdOK()) {
      args.unshift('--username', username, '--password-from-stdin');
      stdin = password;
    } else {
      args.unshift('--username', username, '--password', password);
    }
    args.unshift('--non-interactive', '--no-auth-cache');
  };

  try {
    return await new Promise((resolve, reject) => {
      let child = child_process.spawn(svn, args);
      let stderr = '', stdout = '';
      child.stdout.on('data', data => stdout += data.toString());
      child.stderr.on('data', data => stderr += data.toString());
      child.on('close', (code, signal) => {
        if (code || signal) {
          let error = new Error(`Command failed: ${svn} ${args.join(' ')}`);
          Object.assign(error, { code, signal, stdout, stderr });
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
      if (stdin) child.stdin.write(stdin);
      child.stdin.end();
    })
  } catch (error) {
    if (password) error.message = error.message.split(password).join('******')
    throw error;
  }
}

// common methods across all repositories
class Repository {
  #lastUpdate = 0;
  #depth = 'infinity';
  dir = null;
  url = null;
  mutex = new Mutex();

  constructor({ dir, url, depth }) {
    this.dir = dir;
    this.url = url;
    if (depth) this.#depth = depth;
  }

  // checkout (update) a working copy if not done recently.
  // default Time To Live (TTL) is 5 minutes.
  async update(request, ttl = 5 * 60 * 1000) {
    await fsp.access(this.dir).catch(() => { ttl = 0 });
    if (Date.now() - this.#lastUpdate < ttl) return;
    const release = await this.mutex.acquire();

    try {
      if (Date.now() - this.#lastUpdate < ttl) return;

      await fsp.mkdir(svnPath, { recursive: true });

      let { stdout, stderr } = await fsp.access(this.dir).then(
        () => svncmd(request, `update ${this.dir}`),
        () => svncmd(request, `checkout ${this.url} ${this.dir} --depth ${this.#depth}`)
      );

      this.#lastUpdate = Date.now();

      return stdout + stderr;
    } finally {
      release();
    }
  }

  // overrideable filename to path wrapper
  map(file) {
    return `${this.dir}/${file}`
  }

  // check if a file exists in the working copy
  async exist(file, request) {
    await this.update(request);

    return await fsp.stat(this.map(file)).then(() => true, () => false);
  }

  // get the last modification time for a file
  // returns null if file does not exist
  async mtime(file, request) {
    await this.update(request);

    try {
      return (await fsp.stat(this.map(file))).mtimeMs;
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  // read a file from the working copy
  async read(file) {
    return fsp.readFile(this.map(file), 'utf8');
  }

  async fork(request) {
    let repo = `${repoPath}/${path.basename(this.dir)}`;
    let exists = await fsp.access(repo).then(() => true, () => false);
    if (exists) return;

    try {
      await fsp.mkdir(repoPath);
      broadcast(Actions.setForked(true));
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }

    await exec(`svnadmin create ${repo}`);

    let info = await svncmd(request, `info ${this.dir}`);
    let log = await svncmd(request, `log --limit 1 ${this.dir}`);
    await fsp.writeFile(`${this.dir}.log`, info.stdout + log.stdout);

    await fsp.rename(`${this.dir}`, `${this.dir}.apache`);

    await svncmd(request, `checkout file://${repo} ${this.dir}`);

    for (let file of await fsp.readdir(`${this.dir}.apache`)) {
      if (file !== '.svn') {
        await fsp.rename(`${this.dir}.apache/${file}`, `${this.dir}/${file}`);
      }
    };

    rimraf(`${this.dir}.apache`, error => {
      if (error) console.error(error)
    });

    await svncmd(request, `add ${this.dir}/*`);
    await svncmd(request, `commit ${this.dir} --file ${this.dir}.log`);
    await fsp.unlink(`${this.dir}.log`);
    await svncmd(request, `update ${this.dir}`);

    this.#lastUpdate = Date.now();

    return (await svncmd(request, `log ${this.dir} `)).stdout;
  }

  // stub for now, but what this will eventually do is to create
  // a revision of the file and commit it; trying repeatedly until
  // the commit succeeds.  The callback will be called with the
  // current contents of the file to be revised each time, and
  // is expected to return the intended new contents.
  async revise(file, message, request, callback) {
    if (process.env.NODE_ENV === 'development') {
      await this.fork(request);
    }

    let oldContents = await this.read(file);
    let newContents = await callback(oldContents);
    if (!newContents) throw new Error("new revision is empty");
    if (newContents === oldContents) {
      console.warn("revision is unchanged")
    } else {
      await new Promise((resolve, reject) => {
        let wstream = fs.createWriteStream(this.map(file));
        wstream.on('finish', resolve);
        wstream.write(newContents);
        wstream.end();
      })
    }
  }
}

export let Board = new Repository({ dir: boardDir, url: boardUrl, depth: 'files' });

// return a list of agendas
Board.agendas = async function (request) {
  await this.update(request);

  return (await fsp.readdir(this.dir)).filter(name => /^board_agenda_\d/.test(name)).sort();
}

// return a list of unpublished minutes
Board.draftMinutes = async function (request) {
  await this.update(request);

  return (await fsp.readdir(this.dir)).filter(name => /^board_minutes_/.test(name)).sort();
}

export const Minutes = new Repository({ dir: minutesDir, url: minutesUrl });

// minutes are stored in annual directories
Minutes.map = function (file) {
  let year = file.match(/_(\d{4})_/)[1];
  return `${Minutes.dir}/${year}/${file}`
}

export let Committers = new Repository({ dir: committersDir, url: committersUrl });

export async function forked() {
  return await fsp.access(repoPath).then(() => true, () => false);
}

// remove all svn directories that are checked out from a local repository,
// then delete all local repositories.
export async function reset() {
  if (!await forked()) return;

  await Promise.all(
    (await fsp.readdir(repoPath)).map(name => (
      new Promise((resolve, reject) => {
        rimraf(`${svnPath}/${name}`, error => {
          error ? reject(error) : resolve()
        })
      }))
    )
  );

  await new Promise((resolve, reject) => {
    rimraf(repoPath, error => {
      error ? reject(error) : resolve()
    })
  })

  broadcast(Actions.setForked(false));
}

export async function demoMode() {
  let mock = await import(`${__dirname}/__mocks__/svn.js`);
  mock.Board.agendas = Board.agendas;
  mock.Board.draftMinutes = Board.draftMinutes;
  Board = mock.Board;
  Committers = mock.Committers;
}