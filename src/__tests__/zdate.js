import * as zdate from '../zdate.js';

test('zset', () => {
  let date = new Date('2021-05-19T22:00:00Z');
  date = zdate.zset(date, { hours: 23, minutes: 30 });
  expect(date.toISOString()).toBe('2021-05-19T23:30:00.000Z')
});

test('format', () => {
  let date = new Date('2021-04-21T22:00:00Z');

  expect(zdate.formatDate(date)).toBe('Wed, 21 Apr 2021 at 22:00 UTC');
  expect(zdate.formatMonth(date)).toBe('April');
  expect(zdate.formatYear(date)).toBe('2021');
  expect(zdate.formatMonthDay(date)).toBe('Wed, April 21st');
  expect(zdate.formatISO(date)).toBe('2021-04-21T22:00:00Z');
  expect(zdate.formatTime(date)).toBe('22:00');
  expect(zdate.agendaLink(date)).toBe('https://whimsy.apache.org/board/agenda/2021-04-21/');
});

test('parse', () => {
  expect(zdate.parse('April 21, 2021 22:00').toISOString()).toBe('2021-04-21T22:00:00.000Z');
  expect(zdate.parse('Wed, 21 April 2021, 22:00').toISOString()).toBe('2021-04-21T22:00:00.000Z');
  expect(zdate.parse('Wed, 21 April 2021, 10:00pm').toISOString()).toBe('2021-04-21T22:00:00.000Z');
});
