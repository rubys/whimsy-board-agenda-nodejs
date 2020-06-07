// a mock that reads from a local minutes files and stores updates in memory.

import { promises as fs } from 'fs';
import yaml from 'yaml';

let cache = {};

export async function read(agenda, request) {
  let minutesFile = agenda.replace("_agenda_", "_minutes_").replace(".txt", ".yml");

  if (!cache[minutesFile]) {
    cache[minutesFile] = yaml.parse(await fs.readFile(`${__dirname}/${minutesFile}`, 'utf8'));
  }

  return { ...cache[minutesFile] };
}

export async function write(agenda, minutes) {
  let minutesFile = agenda.replace("_agenda_", "_minutes_").replace(".txt", ".yml");
  cache[minutesFile] = minutes;
  return minutes;
}

export function reset() {
  cache = {};
}

if (process.env.NODE_ENV === 'test') {
  afterEach(reset);
}