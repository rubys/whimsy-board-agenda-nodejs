import { cachePath } from './config.js';
import fs, { promises as fsp } from 'fs';
import md5 from "md5";

// return contents of cache file if exist and is not stale
export async function read(file, ttl, mtime) {
  try {
    let stats = await fsp.stat(`${cachePath}/${file}`);
    if (mtime && stats.mtimeMs > mtime) return null;
    if (ttl && Date.now() - stats.mtimeMs > ttl) return null;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }

  return fsp.readFile(`${cachePath}/${file}`, 'utf8');
};

export async function write(file, data) {
  await fsp.mkdir(cachePath, { recursive: true });

  await new Promise((resolve, reject) => {
    let wstream = fs.createWriteStream(`${cachePath}/${file}`);
    wstream.on('finish', resolve);
    wstream.write(data);
    wstream.end();
  });
};

// return a digest of all cache files
export async function digest() {
  try {
    return Object.fromEntries(
      await Promise.all([
        ...(await fsp.readdir(cachePath)).map(async (name) => (
          [name.split('.')[0], md5(await fsp.readFile(`${cachePath}/${name}`, 'utf8'))]
        ))
      ])
    );
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}
