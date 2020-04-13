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

// ensure that there is a fresh checkout of the foundation/board directory
// in the work/svn directory.
let lastBoardUpdate = 0;
export async function updateBoard(request, ttl = 5 * 60 * 1000) {
  if (Date.now() - lastBoardUpdate < ttl) return;
  const release = await mutex.acquire();

  await fs.mkdir(svn, { recursive: true });

  return new Promise((resolve, reject) => (
    exec(`${svncmd(request)} checkout ${boardUrl} ${boardDir} --depth files`,
      { cwd: svn },
      (error, stdout, stderr) => {
        release();
        lastBoardUpdate = Date.now();
        error ? reject(error) : resolve(stdout + stderr);
      }
    )
  ));
}

// ensure that there is a fresh checkout of the foundation/board directory
// in the work/svn directory.
let lastMinutesUpdate = 0;
export async function updateMinutes(request, ttl = 5 * 60 * 1000) {
  if (Date.now() - lastMinutesUpdate < ttl) return;
  const release = await mutex.acquire();

  await fs.mkdir(svn, { recursive: true });

  return new Promise((resolve, reject) => (
    exec(`${svncmd(request)} checkout ${minutesUrl} ${minutesDir} --depth files`,
      { cwd: svn },
      (error, stdout, stderr) => {
        release();
        lastMinutesUpdate = Date.now();
        error ? reject(error) : resolve(stdout + stderr);
      }
    )
  ));
}

// return a list of agendas
export async function agendas(request) {
  await updateBoard(request);

  return (await fs.readdir(boardDir)).filter(name => /^board_agenda_\d/.test(name)).sort();
}

export async function agendaExist(file, request) {
  await updateBoard(request);

  return await fs.stat(`${boardDir}/${file}`).then(() => true).catch(() => false);
}

export async function agendaMtime(file, request) {
  await updateBoard(request);

  return (await fs.stat(`${boardDir}/${file}`)).mtimeMs;
}

export async function minutesExist(file, request) {
  await updateBoard(request);

  let year = file.match(/_(\d{4})_/)[1];

  return await fs.stat(`${minutesDir}/${year}/${file}`).then(() => true).catch(() => false);
}

export async function minutesMtime(file, request) {
  await updateBoard(request);

  let year = file.match(/_(\d{4})_/)[1];

  return (await fs.stat(`${minutesDir}/${year}/${file}`)).mtimeMs;
}

// return a list of unpublished minutes
export async function draftMinutes(request) {
  await updateBoard(request);

  return (await fs.readdir(boardDir)).filter(name => /^board_minutes_/.test(name)).sort();
}

export async function read(file) {
  return fs.readFile(`${boardDir}/${file}`, 'utf8');
}
