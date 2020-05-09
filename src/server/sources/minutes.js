
// NODE_ENV == 'development':
//  fetch and return minutes from live whimsy server, converting
//  from YAML to a JavaScript object
// 
// NODE_ENV == 'production':
//   TODO

import devproxy from './devproxy.js';
import yaml from 'yaml';

export default async function minutes(request, date) {

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
  if (!source) return null;
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
