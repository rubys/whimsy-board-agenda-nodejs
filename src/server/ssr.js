import { promises as fs } from "fs";
import path from 'path';

export default async function ssr(request, response) {
  let template = await fs.readFile(path.join(__dirname, '../../build', 'index.html'), 'utf8');
  response.send(template);
}
