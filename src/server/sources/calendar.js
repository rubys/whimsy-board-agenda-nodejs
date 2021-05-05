import { Committers } from "../svn.js";
import { DateTime } from 'luxon';

// return parsed calendar

export default async function calendar(request) {

  let source = await Committers.read('calendar.txt', request);

  let times = Array.from(source.matchAll(/^\s+\*\)\s(.*?) (\w+)$/gm), match => {
    let zone = match[2] === 'Pacific' ? "America/Los_Angeles" : 'UTC';

    let time = DateTime.fromFormat(
      match[1],
      'EEE, dd MMMM yyyy, HH:mm',
      { zone: match[2] }
    );

    return { time: time.toISO(), int: time.valueOf() };
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
  let month = now.getMonth()+1;
  let year = now.getFullYear();
  let day = 14 + (11 - DateTime.fromObject({ month, day: 1, year }).weekday) % 7;

  meeting = DateTime.fromObject({ month, day, year, hour: 20, zone: 'UTC' });

  if (meeting.valueOf() > now.valueOf()) return meeting.valueOf();

  // chose 20:00 UTC on the third Wednesday of next month
  if (month == 12) {
    month = 1;
    year++;
  } else {
    month ++;
  };

  day = 14 + (11 - DateTime.fromObject({ month, day: 1, year }).weekday) % 7;
  meeting = DateTime.fromObject({ month, day, year, hour: 20, zone: 'UTC' });
  return meeting.valueOf();
}
