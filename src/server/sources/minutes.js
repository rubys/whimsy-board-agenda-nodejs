import { agendaPath } from "../config.js";
import devproxy from './devproxy.js';
import { promises as fs } from 'fs';
import yaml from 'yaml';

export async function read(agenda, request) {
  let minutes = agenda.replace("_agenda_", "_minutes_").replace(".txt", ".yml");

  return await fs.readFile(`${agendaPath}/${minutes}`, 'utf8')
    .then(contents => yaml.parse(contents))
    .catch(() => (
      process.env.NODE_ENV === 'development' && request ? remoteMinutes(request, agenda) : {}
    ));
}

export async function write(agenda, minutes) {
  let minutesFile = agenda.replace("_agenda_", "_minutes_").replace(".txt", ".yml");

  await fs.mkdir(agendaPath, { recursive: true });
  await fs.writeFile(`${agendaPath}/${minutesFile}`, yaml.stringify(minutes));

  return minutes;
}

// fetch and return minutes from live whimsy server, converting
// from YAML to a JavaScript object
export async function remoteMinutes(request, agenda) {
  let date = agenda.match(/\d[_\d]+/)[0].replace(/_/g, '-');

  function desymbolize(object) {
    for (let key in object) {
      if (typeof object[key] === "object") {
        object[key] = desymbolize(object[key]);
      }

      if (key.startsWith(':')) {
        object[key.slice(1)] = object[key];
        delete object[key];
      }

    }

    return object;
  }

  let source = await devproxy(request, `${date}.yaml`);
  if (!source) return {};
  let items = desymbolize(yaml.parse(source));

  let minutes = {};

  for (let prop of ['started', 'attendance', 'complete', 'rejected', 'todos']) {
    if (items[prop]) {
      minutes[prop] = items[prop];
      delete items[prop];
    }
  }

  minutes.items = items;

  return minutes;
}