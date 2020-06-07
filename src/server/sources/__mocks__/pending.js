// a mock that reads from a local pending.yml and stores updats in memory.

import { promises as fs } from 'fs';
import yaml from 'yaml';

let cache = null;

let empty = {
  approved: [],
  comments: {},
  flagged: [],
  seen: {},
  status: [],
  unapproved: [],
  unflagged: []
}

export async function read(request) {
  if (!cache) {
    cache = yaml.parse(await fs.readFile(`${__dirname}/pending.yml`, 'utf8'));
  }

  return { ...empty, ...cache };
}

export async function write(request, pending) {
  cache = pending;
  return pending;
}

// convenience method bundling the read and write of an agenda.
export async function update(request, agenda, callback) {
  let pending = await read(request);
  return await write(request, callback(pending));
}

export function reset() {
  cache = null;
}

export function backup() {
}

export default read;

if (process.env.NODE_ENV === 'test') {
  afterEach(reset);
}