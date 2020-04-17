import ldap from 'ldapjs';

let client = null;

// create a connection to the ldap server 
export async function open() {
    if (client) return client;

    client = ldap.createClient({
        url: 'ldaps://ldap-us-ro.apache.org:636',
        tlsOptions: { rejectUnauthorized: false }
    });

    return client;
}

// return a mapping of public names to availids
let _names = null;
export async function names() {
    if (_names) return _names;
    if (!client) await open();

    let base = 'ou=people,dc=apache,dc=org';

    let options = {
        filter: 'uid=*',
        scope: 'sub',
        attributes: ['cn', 'uid']
    }

    _names = {};

    return new Promise((resolve, reject) => {
        client.search(base, options, (err, res) => {
            if (err) reject(err);

            res.on('searchEntry', entry => {
                let object = entry.object;
                _names[object.cn] = object.uid;
            });

            res.on('end', result => {
                resolve(_names);
            });
        });
    });
}


// return a list of member availids
let _members = null;
export async function members() {
    if (_members) return _members;
    if (!client) await open();

    let base = 'cn=member,ou=groups,dc=apache,dc=org';

    let options = {
        attributes: ['memberUid']
    }

    _members = [];

    return new Promise((resolve, reject) => {
        client.search(base, options, (err, res) => {
            if (err) reject(err);

            res.on('searchEntry', entry => {
                _members = entry.object.memberUid;
            });

            res.on('end', result => {
                resolve(_members);
            });
        });
    });
}

// close the connection to the ldap server
export async function close() {
    if (client) client.destroy();
    client = null;
}
