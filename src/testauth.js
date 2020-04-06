const ldap = require('ldapjs');

(async () => {
  let username = process.argv[2] || require("os").userInfo().username;
  let password = process.argv[3] || await ((async () => {
    return new Promise((resolve, reject) => {
      var readline = require('readline');
      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      });

      rl.question('password: ', (answer) => {
        resolve(answer);
        rl.close();
      });
    });
  })());
  
  let client = ldap.createClient({
    url: 'ldaps://ldap-us-ro.apache.org:636',
    tlsOptions: { rejectUnauthorized: false }
  });

  let dn = `uid=${username},ou=people,dc=apache,dc=org`;
  client.bind(dn, password, (error) => {
    console.log(error ? 'fail' : 'pass');
    client.destroy();
  });
})()
