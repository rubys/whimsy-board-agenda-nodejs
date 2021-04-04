import { Committers } from "../svn.js";
import moment from 'moment-timezone';

// return parsed calendar

export default async function calendar(request) {

  let source = await Committers.read('calendar.txt', request);

  let times = Array.from(source.matchAll(/^\s+\*\)\s(.*?) (\w+)$/gm), match => {
    let zone = match[2] === 'Pacific' ? "America/Los_Angeles" : 'UTC';
    let time = moment.tz(match[1], 'ddd, DD MMMM YYYY, hh:mm a', zone)
    return { time: time.format(), int: time.valueOf() };
  })

  return times;
}

// return time of next meeting

export async function nextMeeting(request) {
  let now = Date.now();
  return (await calendar(request))
    .map(meeting => meeting.int)
    .filter(time => time >= now)
    [0]
}
