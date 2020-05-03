import credentials from './credentials.js';
import shellEscape from "shell-escape";
import fs, { promises as fsp } from 'fs';
import { exec } from 'child_process';
import { Mutex } from 'async-mutex';
import { workPath } from './config.js';

const svn = `${workPath}/svn`;

const boardDir = `${svn}/foundation_board`;
const boardUrl = 'https://svn.apache.org/repos/private/foundation/board';

const minutesDir = `${svn}/minutes`;
const minutesUrl = 'https://svn.apache.org/repos/asf/infrastructure/site/trunk/content/foundation/records/minutes';

const committersDir = `${svn}/board`;
const committersUrl = 'https://svn.apache.org/repos/private/committers/board';

// build an authenticated subversion command
function svncmd(request) {
  let svn = 'svn';
  if (!request) return svn;
  let { username, password } = credentials(request);
  if (!password) return svn;
  return `${svn} --non-interactive --no-auth-cache ` +
    shellEscape(['--username', username, '--password', password])
};

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
    if (Date.now() - this.#lastUpdate < ttl) { release(); return };

    await fsp.mkdir(svn, { recursive: true });

    return new Promise((resolve, reject) => (
      exec(`${svncmd(request)} checkout ${this.url} ${this.dir} --depth ${this.#depth}`,
        { cwd: svn },
        (error, stdout, stderr) => {
          this.#lastUpdate = Date.now();
          release();
          error ? reject(error) : resolve(stdout + stderr);
        }
      )
    ));
  }

  // overrideable filename to path wrapper
  map(file) {
    return `${this.dir}/${file}`
  }

  // check if a file exists in the working copy
  async exist(file, request) {
    await this.update(request);

    return await fsp.stat(this.map(file)).then(() => true).catch(() => false);
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

  // stub for now, but what this will eventually do is to create
  // a revision of the file and commit it; trying repeatedly until
  // the commit succeeds.  The callback will be called with the
  // current contents of the file to be revised each time, and
  // is expected to return the intended new contents.
  async revise(file, message, request, callback) {
    let oldContents = await this.read(file);
    let newContents = await callback(oldContents);
    if (!newContents) throw new Error("new revision is empty");
    if (newContents === oldContents) {
      console.warn("revision is unchanged")
    } else {
      return new Promise((resolve, reject) => {
        let wstream = fs.createWriteStream(this.map(file));
        wstream.on('finish', resolve);
        wstream.write(newContents);
        wstream.end();
      })
    }
  }
}

export const Board = new Repository({ dir: boardDir, url: boardUrl, depth: 'files' });

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

export const Committers = new Repository({ dir: committersDir, url: committersUrl })
