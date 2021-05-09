import React from "react";
import { Link } from "react-router-dom";
import { connect } from 'react-redux';

//
// Client side "404" not found page
//

function mapStateToProps(state) {
  return {
    agendas: state.server?.agendas || [],
  }
};

function NotFound(props) {
  let { agendas, location } = props;

  return <>
    <header className="navbar fixed-top missing">
      <div className="navbar-brand">Not found</div>
    </header>

    <main>
      <p><code>{location.pathname}</code> was not found on this server.</p>

      {agendas.length === 0 ? null : <>
         <h2>Available agendas</h2>
         <ul>
           {agendas.map(agenda => {
             agenda = agenda.match(/\d+_\d+_\d+/)[0].replace(/_/g, '-');
             return <li><a href={`/${agenda}/`}>{agenda}</a></li>
           })}
         </ul>
      </>}
    </main>

    <footer className="navbar fixed-bottom missing">
      <Link aria-label='prev' className="navbar-brand backlink blank" rel="prev" to="/help">Help</Link>
    </footer>
  </>
};

export default connect(mapStateToProps)(NotFound)
