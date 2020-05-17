import { nextMeeting } from './calendar.js';
import { Board, Templates } from '../svn.js';
import moment from 'moment';
import Mustache from 'mustache';

export default async function reminderText(request) {
  let meeting = moment(new Date(await nextMeeting(request))).tz('UTC');
  let due = meeting.subtract(1, 'week');

  let file = (await Board.agendas(request)).sort().pop();
  let agenda = await Board.read(file, request);
  let timeZoneInfo = agenda.match(/Other Time Zones: (.*)/)?.[1];

  let view = {
    meetingDate: meeting.format('ddd, DD MMM YYYY [at] hh:mm:ss a z'),
    month: meeting.format('MMMM'),
    year: meeting.format('YYYY'),
    timeZoneInfo,
    dueDate: due.format('ddd, MMM Do'),
    agenda: meeting.format('[https://whimsy.apache.org/board/agenda/]YYYY-MM-DD/')
  };

  let { reminder } = request.params;
  let template = await Templates.read(`${reminder}.txt`, request);
  let body = Mustache.render(template, view);

  let subject = '';
  body = body.replace(/Subject: (.*)\n+/, () => {
    subject = RegExp.$1
    return '';
  });

  return { subject, body, view }
}