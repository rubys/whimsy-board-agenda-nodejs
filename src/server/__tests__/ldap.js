// this may not be a good idea (or even work) long term
// but it is useful for now...

import * as ldap from '../ldap.js';

test('find committer id by name', async () => {
  let names = await ldap.names();
  expect(names['Sam Ruby']).toEqual('rubys');
});

test('verify member status', async () => {
  let members = await ldap.members();
  expect(members).toContain('rubys');
});

test('project committers', async () => {
  let committers = await ldap.projectCommitters('whimsy');
  expect(committers).toContain('rubys');
});