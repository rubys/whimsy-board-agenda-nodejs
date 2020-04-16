import { cachePath } from './config.js';
import { promises as fs } from 'fs';
import md5 from "md5";

// return contents of cache file if exist and is not stale
export async function read(file, ttl, mtime) {
  try {
    let stats = await fs.stat(`${cachePath}/${file}`);
    if (mtime && mtime > stats.mtimeMs) return null;
    if (ttl && Date.now() - stats.mtimeMs > ttl) return null;
  } catch {
    return null;
  }

  return fs.readFile(`${cachePath}/${file}`, 'utf8');
};

export async function write(file, data) {
  await fs.mkdir(cachePath, { recursive: true });
  return fs.writeFile(`${cachePath}/${file}`, data, 'utf8');
};

// return a digest of all cache files
export async function digest() {
  return Object.fromEntries(
    await Promise.all([
      ...(await fs.readdir(cachePath)).map(async (name) => {
        return [name.split('.')[0], md5(await fs.readFile(`${cachePath}/${name}`, 'utf8'))]
      })
    ])
  );
}