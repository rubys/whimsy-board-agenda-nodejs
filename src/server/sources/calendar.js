import { Committers } from "../svn.js";
import { parse, formatISO, zset, sub, nextWednesday } from '../../zdate.js';

// return parsed calendar

export default async function calendar(request) {

  let source = await Committers.read('calendar.txt', request);

  let times = Array.from(source.matchAll(/^\s+\*\)\s(.*?) (\w+)$/gm), match => {
    // match[2] == zone, ignored for now

    let time = parse(match[1]);
    return { time: formatISO(time), int: time.valueOf() };
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

  // find the next wednesday that falls on the third week of the month
  meeting = zset(new Date(now), { hours: 20, minutes: 0, seconds: 0, milliseconds: 0});
  if (meeting.valueOf() > now) meeting = sub(meeting, {days: 1});
  meeting = nextWednesday(meeting);
  while (meeting.getDate() <= 14 || meeting.getDate() > 21) {
    meeting = nextWednesday(meeting);
  }

  return meeting.valueOf();
}
