// mock replacement for svn, used in tests that specify jest.mock('../svn.js');
//
// reads from a svn directory in this location, writes are done to memory only.

import { promises as fsp } from 'fs';

const actual = jest.requireActual('../svn.js');

class Repository {
  dir = null;
  updates = {};

  constructor(dir) {
    this.dir = `${__dirname}/svn/${dir}`;
  }

  map(file) {
    return `${this.dir}/${file}`
  }

  // check if a file exists in the working copy
  async exist(file, request) {
    if (this.updates[file]) return

    return await fsp.stat(this.map(file)).then(() => true, () => false);
  }

  async mtime(file, request) {
    if (this.updates[file]) return this.updates[file].mtime;

    try {
      return (await fsp.stat(this.map(file))).mtimeMs;
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  async read(file) {
    if (this.updates[file]) return this.updates[file].contents;
    return fsp.readFile(this.map(file), 'utf8');
  }

  async revise(file, message, request, callback) {
    let oldContents = await this.read(file);
    let newContents = await callback(oldContents);
    this.updates[file] = { mtime: new Date(), contents: newContents };
    return newContents;
  }
}

export const Board = new Repository('foundation_board');
export const Committers  = new Repository('board');
