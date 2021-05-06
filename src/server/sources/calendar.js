import { Committers } from "../svn.js";
import { dayjs } from '../config.js';

// return parsed calendar

export default async function calendar(request) {

  let source = await Committers.read('calendar.txt', request);

  let times = Array.from(source.matchAll(/^\s+\*\)\s(.*?) (\w+)$/gm), match => {
    let zone = match[2] === 'Pacific' ? "America/Los_Angeles" : 'UTC';

    let time = dayjs(match[1], 'ddd, DD MMMM YYYY, hh:mm').tz('UTC', true).utc();

    return { time: time.format('YYYY-MM-DD[T]HH:mm:ss[Z]'), int: time.valueOf() };
  })

  return times;
}

// return time of next meeting

export async function nextMeeting(request) {
  let now = Date.now();

  // search calendar.txt for next meeting
  let meeting = (await calendar(request))
    .map(meeting => meeting.int)
    .filter(time => time >= now)
    [0];

  if (meeting) return meeting;

  // try 20:00 UTC on the third Wednesday of this month
  now = new Date(now);
  let month = now.getMonth();
  let year = now.getFullYear();
  let day = 14 + (11 - dayjs({ month, day: 1, year }).day()) % 7;

  meeting = dayjs.utc({ month, day, year, hour: 20 });

  if (meeting.valueOf() > now.valueOf()) return meeting.valueOf();

  // chose 20:00 UTC on the third Wednesday of next month
  month = ++month % 12;
  if (month === 0) year++;

  day = 14 + (11 - dayjs({ month, day: 1, year }).day()) % 7;
  meeting = dayjs.utc({ month, day, year, hour: 20 });
  return meeting.valueOf();
}
