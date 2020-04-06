import Agenda from "../models/agenda.js";
import Link from "../elements/link.js";
import Minutes from "../models/minutes.js";
import React from "react";

//
// Overall Agenda page: simple table with one row for each item in the index
//
class Index extends React.Component {
  render() {
    let started = Minutes.started;

    return <>
      <header>
        <h1>ASF Board Agenda</h1>
      </header>

      <table className="agenda table-bordered">
        <thead>
          <tr>
            <th>Attach</th>
            <th>Title</th>
            <th>Owner</th>
            <th>Shepherd</th>
          </tr>
        </thead>

        <tbody>
          {Agenda.index.map(row => (
            <tr className={row.color} key={row.attach}>
              <td>{row.attach}</td>

              {started && /^(\d+|[A-Z]+)$/m.test(row.attach) && !row.skippable ? <td>
                <Link text={row.title} href={"flagged/" + row.href} />
              </td> : <td>
                  <Link text={row.title} href={row.href} />
                </td>}

              <td>{row.owner || row.chair_name}</td>
              <td>{row.shepherd ? <Link text={row.shepherd} href={`shepherd/${row.shepherd.split(" ")[0]}`} /> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  }
};

export default Index