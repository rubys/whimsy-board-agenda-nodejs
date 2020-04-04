import { agendas, read } from './svn.js';
import * as ldap from './ldap.js';
import { parse } from './agenda.js';

(async () => {
  let agenda = await read((await agendas()).pop());
  console.log(JSON.stringify(await parse(agenda), null, 2));
  ldap.close();
})()
  .catch((error) => {console.log(error); console.log(error.stack); process.exit(1)});