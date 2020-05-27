import ldap from 'ldapjs';
import * as cache from './cache.js';

let client = null;
let TTL = 15 * 60 * 1000; // fifteen minutes as these values don't change often
const TIMELIMIT = 30; // seconds

// create a connection to the ldap server 
export async function open() {
  if (client) return client;

  client = ldap.createClient({
    url: 'ldaps://ldap-us-ro.apache.org:636',
    tlsOptions: { rejectUnauthorized: false }
  });

  return client;
}

// return a mapping of availids to public names
export async function ids() {
  return Object.fromEntries(Object.entries(await names()).map(([name, id]) => [id, name]));
}

// return a mapping of public names to availids
export async function names() {
  let cache_file = 'committers.json';
  let names = await cache.read(cache_file, TTL);
  if (names) return JSON.parse(names);
  if (!client) await open();

  let base = 'ou=people,dc=apache,dc=org';

  let options = {
    filter: 'uid=*',
    scope: 'sub',
    attributes: ['cn', 'uid'],
    timeLimit: TIMELIMIT
  }

  names = {};

  return new Promise((resolve, reject) => {
    client.search(base, options, (err, res) => {
      if (err) reject(err);

      res.on('searchEntry', entry => {
        let object = entry.object;
        names[object.cn] = object.uid;
      });

      res.on('end', result => {
        resolve(names);
        cache.write(cache_file, JSON.stringify(names));
      });
    });
  });
}


// return a list of member availids
export async function members() {
  let cache_file = 'members.json';
  let members = await cache.read(cache_file, TTL);
  if (members) return JSON.parse(members);
  if (!client) await open();

  let base = 'cn=member,ou=groups,dc=apache,dc=org';

  let options = {
    attributes: ['memberUid'],
    timeLimit: TIMELIMIT
  }

  members = [];

  return new Promise((resolve, reject) => {
    client.search(base, options, (err, res) => {
      if (err) reject(err);

      res.on('searchEntry', entry => {
        members = entry.object.memberUid;
      });

      res.on('end', result => {
        resolve(members);
        cache.write(cache_file, JSON.stringify(members));
      });
    });
  });
}


// return a project committers
export async function projectCommitters(project) {
  if (!client) await open();

  if (!/^[a-z]*$/.test(project)) 
    throw new TypeError(`invalid project name: ${JSON.stringify(project)}`);

  let base = `cn=${project},ou=project,ou=groups,dc=apache,dc=org`;

  let options = {
    scope: 'sub',
    attributes: ['member'],
    timeLimit: TIMELIMIT
  }

  let members = [];

  return new Promise((resolve, reject) => {
    client.search(base, options, (err, res) => {
      if (err) reject(err);

      res.on('searchEntry', entry => {
        members.push(...entry.object.member.map(dn => dn.match(/^uid=(.*?),/)[1]));
      });

      res.on('end', result => {
        resolve(members);
      });
    });
  });
}

// close the connection to the ldap server
export async function close() {
  if (client) client.destroy();
  client = null;
}

// shutdown cleanly on exit
process.on('exit', async () => {
  await close();
});
