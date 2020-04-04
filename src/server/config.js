import path from 'path';

export const port = 3001;

export const buildPath = path.resolve(__dirname, '../../build');
export const workPath = path.resolve(__dirname, '../../work');

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
