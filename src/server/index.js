import express from 'express';
import compression from 'compression';
import { port, buildPath } from './config.js';
import { agendas, read } from './svn.js';
import { parse } from './agenda.js';

const app = express();
app.use(compression());

app.get('/api/latest.json', async (req, res) => {
  res.json(await parse(await read((await agendas()).pop())));
});

app.use('/', express.static(buildPath, { index: false }));

app.listen(port, () => {
  console.log(`Whimsy board agenda app listening on port ${port}`);
});
