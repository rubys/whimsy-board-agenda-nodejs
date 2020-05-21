//
// Configure nodemon to restart the server when a server source file changes.
//
// When restarting, use the list of files that changed to determine
// how to intelligently remove cache files.
//
// src/server/sources/agenda.js => remove /work/cache/board_agenda_*
// src/server/sources/agenda/*  => remove /work/cache/board_agenda_*
// src/server/sources/other.js  => remove /work/cache/other.js* (which matches json)
//
const fs = require('fs');

const nodemon = require('nodemon');

nodemon({
  script: 'src/server.js',
  watch: [
    'src/client/events/shared-worker.js',
    'src/server',
    'src/server.js'
  ]
});

nodemon.on('start', function () {
});

nodemon.on('quit', function () {
  process.exit();
})

nodemon.on('restart', function (files) {
  console.log('restarting...');
  let sources = process.cwd() + '/src/server/sources/';
  let cache = fs.readdirSync('./work/cache');
  let trash = new Set();

  for (let file of files) {
    if (file.startsWith(sources)) {
      file = file.slice(sources.length);

      let prefix;
      if (file.startsWith('agenda')) {
        prefix = 'board_agenda_';
      } else {
        prefix = file;
      }

      for (let cfile of cache) {
        if (cfile.startsWith(prefix)) trash.add(cfile);
      }
    }
  }

  for (let file of trash) {
    console.log('decaching ', file);
    fs.unlinkSync(`./work/cache/${file}`);
  }
});
