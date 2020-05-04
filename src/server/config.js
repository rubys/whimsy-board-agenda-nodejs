import path from 'path';

export const port = 3001;

export const buildPath = path.resolve(__dirname, '../../build');
export const workPath = path.resolve(__dirname, '../../work');
export const templatePath = path.resolve(__dirname, './templates');
export const cachePath = workPath + '/cache';
export const agendaPath = workPath + '/agenda';

export const TIMEZONE = 'UTC'; // 'America/Los_Angeles'

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
