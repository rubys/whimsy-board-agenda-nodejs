import React from "react";
import { Link } from "react-router-dom";
import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    agenda: state.agenda,
    meetingDay: state.client.meetingDay
  }
};

//
// Overall Agenda page: simple table with one row for each item in the index
//
class Index extends React.Component {
  render() {
    if (!this.props.agenda) return null;

    let { meetingDay } = this.props;

    let agenda = Object.values(this.props.agenda)
      .sort((item1, item2) => item1.sortOrder - item2.sortOrder)

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
          {agenda.map(item => {
            let owner = item.owner;
            if (!owner && item.chair) owner = item.people[item.chair].name;

            return <tr className={item.status.color} key={item.attach}>
              <td>{item.attach}</td>

              {meetingDay && /^(\d+|[A-Z]+)$/m.test(item.attach) && !item.status.skippable
                ? <td>
                  <Link to={"flagged/" + item.href}>{item.title}</Link>
                </td>
                : <td>
                  <Link to={item.href}>{item.title}</Link>
                </td>}

              <td>{owner}</td>

              <td>{item.shepherd
                ? <Link to={`shepherd/${item.shepherd.split(" ")[0]}`}>{item.shepherd}</Link>
                : null
              }</td>
            </tr>
          })}
        </tbody>
      </table>
    </>
  }
};

export default connect(mapStateToProps)(Index)
