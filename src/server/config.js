import path from 'path';

export const port = 3001;

export const rootPath = path.resolve(__dirname, '../..');
export const buildPath = rootPath + '/build';
export const srcPath = rootPath + '/src';
export const templatePath = rootPath + '/templates';
export const workPath = rootPath + '/work';
export const cachePath = workPath + '/cache';
export const agendaPath = workPath + '/agenda';

export const TIMEZONE = 'UTC'; // was: 'America/Los_Angeles'

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
