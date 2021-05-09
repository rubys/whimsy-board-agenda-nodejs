// Timezone aware date parsing, formatting, and arithmetic operations, focusing
// primarily on the timezone of choice for the ASF, current GMT (previously
// US Pacific).

import { add, set, sub, format, parse as lparse } from 'date-fns';

export { add, sub, nextWednesday } from 'date-fns';

function zformat(localDate, formatString) {
  let utcDate = add(localDate, { minutes: localDate.getTimezoneOffset() });
  return format(utcDate, formatString)
}

export function zset(localDate, object) {
  let utcDate = add(localDate, { minutes: localDate.getTimezoneOffset() })
  utcDate = set(utcDate, object);
  return sub(utcDate, { minutes: utcDate.getTimezoneOffset() });
}

export function formatDate(date) {
  return zformat(date, "EEE, d MMM yyyy 'at' HH:mm 'UTC'")
};

export function formatMonth(date) {
  return zformat(date, "MMMM")
}

export function formatYear(date) {
  return zformat(date, "yyyy")
}

export function formatMonthDay(date) {
  return zformat(date, "EEE, MMMM do")
}

export function formatISO(date) {
  return zformat(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
}

export function formatTime(date) {
  return zformat(date, "HH:mm")
};

export function agendaLink(date) {
  return zformat(date, "'https://whimsy.apache.org/board/agenda/'yyyy-MM-dd/")
}

export function parse(string, date = new Date()) {
  let utcDate, format;

  if (string.match(/^\w+,/)) {
    format = 'EEE, dd MMMM yyyy, '
  } else {
    format = 'MMMM dd, yyyy '
  };

  if (string.match(/[ap]m$/)) {
    format += 'hh:mma'
  } else {
    format += 'HH:mm'
  };

  utcDate = lparse(string, format, date);
  return sub(utcDate, { minutes: utcDate.getTimezoneOffset() });
}
