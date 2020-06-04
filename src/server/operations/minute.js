import { members } from '../ldap.js';
import { TIMEZONE } from '../config.js';
import moment from 'moment-timezone';
import { reflow } from '../string-utils.js';
import { read, write } from '../sources/minutes.js';
import * as Agenda from '../sources/agenda.js';

//
// Add secretarial minutes to a given agenda item
//

export default async function (request) {
  let { agenda, action, title, text, reject } = request.body;

  if (!/^board_agenda_\d+_\d+_\d+\.txt$/m.test(agenda)) {
    throw new TypeError(`invalid filenname: ${agenda}`);
  };

  let minutes = await read(agenda, request);

  if (action == "timestamp") {
    let timestamp = moment().tz(TIMEZONE);
    text = timestamp.format("HH:MM");

    if (title == "Call to order") {
      minutes.started = timestamp.valueOf();
    } else if (title == "Adjournment") {
      minutes.complete = timestamp.valueOf();
    }
  } else if (action == "attendance") {
    // lazily initialize attendance information
    let attendance = minutes.attendance = minutes.attendance || {};
    let people = Object.values((await Agenda.read(agenda, request))
      .find(item => item.title == "Roll Call").people);

    for (let person of Object.values(people)) {
      attendance[person.name] = attendance[person.name] || { present: false }
    };

    // update attendance records for attendee
    attendance[request.body.name] = {
      id: request.body.id,
      present: request.body.present,
      notes: request.body.notes?.length ? ` - ${request.body.notes}` : null,
      member: (await members()).includes(request.body.id),
      sortName: (() => {
        let names = request.body.name.split(" ");
        names.unshift(names.pop());
        return names.join(' ');
      })()
    };

    // build minutes for roll call
    text = "Directors Present:\n\n";

    for (let person of people) {
      if (person.role != "director") continue;
      let name = person.name;
      if (!attendance[name].present) continue;
      text += `  ${name}${attendance[name].notes || ''}\n`
    };

    text += "\nDirectors Absent:\n\n";
    let first = true;

    for (let person of people) {
      if (person.role != "director") continue;
      let name = person.name;
      if (attendance[name].present) continue;
      text += `  ${name}${attendance[name].notes || ''}\n`;
      first = false
    };

    if (first) text += "  none\n";
    first = true;

    for (let person of people) {
      if (person.role != "officer") continue;
      let name = person.name;
      if (!attendance[name].present) continue;
      if (first) text += "\nExecutive Officers Present:\n\n";
      text += `  ${name}${attendance[name].notes || ''}\n`;
      first = false
    };

    text += "\nExecutive Officers Absent:\n\n";
    first = true;

    for (let person of people) {
      if (person.role != "officer") continue;
      let name = person.name;
      if (attendance[name].present) continue;
      text += `  ${name}${attendance[name].notes || ''}\n`;
      first = false
    };

    if (first) text += "  none\n";
    first = true;

    for (let [name, records] of Object.entries(attendance).sort((p1, p2) => p1[0].localeCompare(p2[0]))) {
      if (!records.present) continue;
      let person = people.find(person => person.name == name);
      if (person?.role != "guest") continue;
      if (first) text += "\nGuests:\n\n";
      text += `  ${name}${attendance[name].notes || ''}\n`;
      first = false
    };

    title = "Roll Call"
  } else {
    text = reflow(text, 0, 78)
  };

  if (text?.length != 0) {
    minutes.items[title] = text
  } else {
    delete minutes.items[title];
    if (title == "Call to order") delete minutes.started;
    if (title == "Adjournment") delete minutes.complete
  };

  if (reject) {
    minutes.rejected = minutes.rejected || [];

    if (!minutes.rejected.includes(title)) {
      minutes.rejected.push(title)
    }
  } else if (minutes.rejected) {
    delete minutes.rejected[title]
  };

  await write(agenda, minutes);

  return minutes;
}