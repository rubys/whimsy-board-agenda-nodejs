import path from 'path';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import objectSupport from 'dayjs/plugin/objectSupport';

export const port = 3001;

export const rootPath = path.resolve(__dirname, '../..');
export const buildPath = rootPath + '/build';
export const srcPath = rootPath + '/src';
export const templatePath = rootPath + '/templates';
export const workPath = rootPath + '/work';
export const cachePath = workPath + '/cache';
export const agendaPath = workPath + '/agenda';

export const TIMEZONE = 'UTC'; // 'America/Los_Angeles'

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(objectSupport);
dayjs.tz.setDefault('UTC');
export { dayjs };

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
