import credentials from './credentials.js';
import path from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { Mutex } from 'async-mutex';

const mutex = new Mutex();

const root = path.resolve(__filename, '../../..');
const svn = `${root}/work/svn`;

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
  return `${svn} --non-interactive --no-auth-cache --username ${username} --password ${password}`;
};

// ensure that there is a fresh checkout of the foundation/board directory
// in the work/svn directory.
export async function updateBoard(request) {
  const release = await mutex.acquire();

  await fs.mkdir(svn, { recursive: true });

  return new Promise((resolve, reject) => (
    exec(`${svncmd(request)} checkout ${boardUrl} ${boardDir} --depth files`,
      { cwd: svn },
      (error, stdout, stderr) => {
        release();
        error ? reject(error) : resolve(stdout + stderr);
      }
    )
  ));
}

// ensure that there is a fresh checkout of the foundation/board directory
// in the work/svn directory.
export async function updateMinutes(request) {
  const release = await mutex.acquire();

  await fs.mkdir(svn, { recursive: true });

  return new Promise((resolve, reject) => (
    exec(`${svncmd(request)} checkout ${minutesUrl} ${minutesDir} --depth files`,
      { cwd: svn },
      (error, stdout, stderr) => {
        release();
        error ? reject(error) : resolve(stdout + stderr);
      }
    )
  ));
}

// return a list of agendas
export async function agendas(request) {
  await fs.access(boardDir).catch(async () => (
    await updateBoard(request)
  ))

  return (await fs.readdir(boardDir)).filter(name => /^board_agenda_/.test(name)).sort();
}

export async function agendaExist(file, request) {
  await fs.access(boardDir).catch(async () => (
    await updateBoard(request)
  ));

  return await fs.stat(`${boardDir}/${file}`).then(() => true).catch(() => false);
}

export async function agendaMtime(file, request) {
  await fs.access(boardDir).catch(async () => (
    await updateBoard(request)
  ));

  return (await fs.stat(`${boardDir}/${file}`)).mtimeMs;
}

export async function minutesExist(file, request) {
  await fs.access(minutesDir).catch(async () => (
    await updateBoard(request)
  ));

  let year = file.match(/_(\d{4})_/)[1];

  return await fs.stat(`${minutesDir}/${year}/${file}`).then(() => true).catch(() => false);
}

export async function minutesMtime(file, request) {
  await fs.access(minutesDir).catch(async () => (
    await updateBoard(request)
  ));

  let year = file.match(/_(\d{4})_/)[1];

  return (await fs.stat(`${minutesDir}/${year}/${file}`)).mtimeMs;
}

// return a list of unpublished minutes
export async function draftMinutes(request) {
  await fs.access(boardDir).catch(async () => (
    await updateBoard(request)
  ))

  return (await fs.readdir(boardDir)).filter(name => /^board_minutes_/.test(name)).sort();
}

export async function read(file) {
  return fs.readFile(`${boardDir}/${file}`, 'utf8');
}
