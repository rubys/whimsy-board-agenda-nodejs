import { agendaPath } from "../config.js";
import credentials from '../credentials.js';
import { promises as fs } from 'fs';
import yaml from 'yaml';
import { Board } from "../svn.js";

export async function read(request) {
  let { username } = credentials(request);
  let agenda = request.body.agenda || (await Board.agendas(request)).sort().pop();

  let pending = {};

  try {
    pending = yaml.parse(await fs.readFile(`${agendaPath}/${username}.yml`, 'utf8'));
    if (pending.agenda !== agenda) pending = {};
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  let empty = {
    approved: [],
    comments: {},
    flagged: [],
    seen: {},
    status: [],
    unapproved: [],
    unflagged: []
  }

  return { ...empty, agenda, ...pending };
}

export async function write(request, pending) {
  let { username } = credentials(request);

  await fs.mkdir(agendaPath, { recursive: true });
  await fs.writeFile(`${agendaPath}/${username}.yml`, yaml.stringify(pending));

  return pending;
}

// convenience method bundling the read and write of an agenda,
// ensuring that pending is wiped clean if you move to a new agenda.
export async function update(request, agenda, callback) {
  let pending = await read(request);
  if (pending.agenda !== agenda) pending = { ...empty, agenda };
  return await write(request, callback(pending));
}

export async function backup(request) {
  let { username } = credentials(request);
  await fs.rename(`${agendaPath}/${username}.yml`, `${agendaPath}/${username}.bak`);
}

export default read;
