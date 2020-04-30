
import credentials from '../credentials.js';
import CommitteeInfo from "../sources/committee-info.js";

export default async function (request) {
  let { pmcs } = await CommitteeInfo();
  let committee, roster;

  switch (request.body.request) {
    case "committee-list":
      let { username } = credentials(request);
      let committees = { chair: [], member: [], rest: [] };

      pmcs = pmcs.sort((pmc1, pmc2) =>
        (pmc1.public_name || pmc1.id).localeCompare(pmc2.public_name || pmc2.id));

      for (let pmc of pmcs) {
        if (pmc.chairs.some(chair => chair.id == username)) {
          committees.chair.push(pmc.id)
        } else if (pmc.info.includes(username)) {
          committees.member.push(pmc.id)
        } else {
          committees.rest.push(pmc.id)
        }
      };

      return [...committees.chair, ...committees.member, ...committees.rest];

    case "committer-list":
      committee = pmcs.find(pmc => pmc.id === request.body.pmc);
      if (!committee) return;
      roster = committee.committers;

      roster = roster.map(person => ({
        name: person.public_name,
        id: person.id
      }));

      return { members: roster.sort_by(person => person.name) };

    case "committee-members":
      committee = pmcs.find(pmc => pmc.id === request.body.pmc);
      if (!committee) return;
      let chair = committee.chairs[0];
      if (!chair) return;
      roster = { ...committee.roster };
      delete roster[chair.id];
      roster = Object.entries(roster).map(([id, info]) => ({ id, ...info }));
      return { chair, members: roster };

    case "change-chair":
      committee = pmcs.find(pmc => pmc.id === request.body.pmc);
      if (!committee) return;
      outgoing_chair = ASF.Person[committee.chairs[0].id];
      incoming_chair = ASF.Person[request.body.chair];
      if (!outgoing_chair || !incoming_chair) return;
      let template = await fs.readFile("templates/change-chair.erb", "utf8");
      let draft = new Erubis.Eruby(template).result(binding);
      return { draft: draft.reflow(0, 71) };

    case "establish":
      people = request.body.people.split(",").map(id => ASF.Person[id]);
      people.sort_by(person => ASF.Person.sortable_name(person.public_name));
      description = request.body.description.trim().replace(/\.$/, "");
      chair = ASF.Person[request.body.chair];

      let pmcname = request.body.pmcname;
      if (!/[A-Z]/.test(pmcname)) {
        pmcname = pmcname.replace(/\b\w/g, c => c.toUpperCase)
      };

      template = fs.readFileSync("templates/establish.erb", "utf8").untaint;
      draft = new Erubis.Eruby(template).result(binding);
      let names = (draft.match(/^(\s*\*.*\n)+/m) || [])[0];

      if (names) {
        draft[/^(\s*\*.*\n)+/m] = "\n<-@->\n";
        draft = draft.reflow(0, 71);
        draft = draft.replace("\n<-@->\n", names)
      } else {
        draft = draft.reflow(0, 71)
      };

      return { draft, names };

    case "terminate":
      committee = ASF.Committee[request.body.pmc];
      if (!committee) return;
      template = fs.readFileSync("templates/terminate.erb", "utf8").untaint;
      draft = new Erubis.Eruby(template).result(binding);
      return { draft: draft.reflow(0, 71) }
  };
}