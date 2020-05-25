// a mock that reads from a local pending.yml and stores updats in memory.

import { promises as fs } from 'fs';
import yaml from 'yaml';

let cache = null;

export async function read(request) {
  if (!cache) {
    cache = yaml.parse(await fs.readFile(`${__dirname}/pending.yml`, 'utf8'));
  } 

  return cache;
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

export async function reset() {
  cache = null;
}

export default read;