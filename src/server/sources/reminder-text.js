import { nextMeeting } from './calendar.js';
import { Board, Templates } from '../svn.js';
import { sub, formatDate, formatMonth, formatYear, formatMonthDay, agendaLink } from '../../zdate.js';
import Mustache from 'mustache';

export default async function reminderText(request) {
  let meeting = new Date(await nextMeeting(request));
  let due = sub(meeting, {weeks: 1});

  let file = (await Board.agendas(request)).sort().pop();
  let agenda = await Board.read(file, request);
  let timeZoneInfo = agenda.match(/Other Time Zones: (.*)/)?.[1];

  let view = {
    project: '{{{project}}}',
    link: '{{{link}}}',
    meetingDate: formatDate(meeting),
    month: formatMonth(meeting),
    year: formatYear(meeting),
    timeZoneInfo,
    dueDate: formatMonthDay(due),
    agenda: agendaLink(meeting)
  };

  let { reminder } = request.params;
  let template = await Templates.read(`${reminder}.mustache`, request);
  let body = Mustache.render(template, view);

  let subject = '';
  body = body.replace(/Subject: (.*)\n+/, () => {
    subject = RegExp.$1
    return '';
  });

  return { subject, body, template, view }
}
