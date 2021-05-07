import { read } from '../agenda.js';

jest.mock('../../svn.js');

describe("parse", () => {
  it("should parse an agenda file", async () => {
    let parsed = await read("board_agenda_2015_01_21.txt");
   
    let abdera = parsed.find(item => item.title == "Abdera");
    expect(abdera.index).toBe("Committee Reports");

    let ace = parsed.find(item => item.title == "ACE");
    expect(ace.attach).toBe("C");
    expect(ace.owner).toBe("Marcel Offermans");
    expect(ace.missing).toBe(true);
    expect(ace.comments).toBe("cm: Reminder email sent");
    expect(ace.shepherd).toBe("Brett");

    let avro = parsed.find(item => item.title == "Avro");
    expect(avro.attach).toBe("I");
    expect(avro.owner).toBe("Tom White");
    expect(avro.missing).toBeFalsy();
    expect(avro.comments).toBe("");
    expect(avro.shepherd).toBe("Chris");
    expect(avro.approved).toContain("sr");

    let actions = parsed.find(item => item.title == "Action Items");
    let lenya_action = actions.actions.find(action => action.pmc == "Lenya");
    expect(lenya_action.owner).toBe("Chris");
    expect(lenya_action.text).toBe("Summarize comments and follow on the dev list.")
  });

  it("should parse a chair change resolution", async () => {
    let parsed = await read("board_agenda_2015_02_18.txt");
    let resolution = parsed.find(item => item.title == "Change Geronimo Chair");
    let chair = resolution.chair;

    expect(chair).toBe("adc");
    expect(resolution.people[chair].name).toBe("Alan Cabrera");
  })
})
