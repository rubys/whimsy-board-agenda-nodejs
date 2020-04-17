import credentials from './credentials.js';
import shellEscape from "shell-escape";
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { Mutex } from 'async-mutex';
import { workPath } from './config.js';

const mutex = new Mutex();

const svn = `${workPath}/svn`;

const boardDir = `${svn}/foundation_board`;
const boardUrl = 'https://svn.apache.org/repos/private/foundation/board';

const minutesDir = `${svn}/minutes`;
const minutesUrl = 'https://svn.apache.org/repos/asf/infrastructure/site/trunk/content/foundation/records/minutes';

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
  dir = null;
  url = null;

  constructor(dir, url) {
    this.dir = dir;
    this.url = url;
  }

  update = async (request, ttl = 5 * 60 * 1000) => {
    await fs.access(this.dir).catch(() => { ttl = 0 });
    if (Date.now() - this.#lastUpdate < ttl) return;
    const release = await mutex.acquire();

    await fs.mkdir(svn, { recursive: true });

    return new Promise((resolve, reject) => (
      exec(`${svncmd(request)} checkout ${this.url} ${this.dir} --depth files`,
        { cwd: svn },
        (error, stdout, stderr) => {
          release();
          this.#lastUpdate = Date.now();
          error ? reject(error) : resolve(stdout + stderr);
        }
      )
    ));
  }

  // overrideable filename to path wrapper
  map = (file) => (
    `${this.dir}/${file}`
  )

  exist = async (file, request) => {
    await this.update(request);

    return await fs.stat(this.map(file)).then(() => true).catch(() => false);
  }

  mtime = async (file, request) => {
    await this.update(request);

    try {
      return (await fs.stat(this.map(file))).mtimeMs;
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  read = async (file) => {
    return fs.readFile(this.map(file), 'utf8');
  }
}

export const Board = new Repository(boardDir, boardUrl);

// return a list of agendas
Board.agendas = async (request) => {
  await Board.update(request);

  return (await fs.readdir(Board.dir)).filter(name => /^board_agenda_\d/.test(name)).sort();
}

// return a list of unpublished minutes
Board.draftMinutes = async (request) => {
  await Board.update(request);

  return (await fs.readdir(Board.dir)).filter(name => /^board_minutes_/.test(name)).sort();
}

export const Minutes = new Repository(minutesDir, minutesUrl);

Minutes.map = (file) => {
  let year = file.match(/_(\d{4})_/)[1];

  return `${Minutes.dir}/${year}/${file}`
}
