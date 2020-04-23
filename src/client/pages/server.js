// visually display the contents of the Redux store

import React from 'react';
import { connect } from 'react-redux';

function Server( { agendas, drafts }) {

  let links = [
    ...agendas.map(agenda => `/api/${agenda.match(/\d+_\d+_\d+/)[0].replace(/_/g, "-")}.json`),
    '/api/historical-comments',
    '/api/digest',
    '/api/jira',
    '/api/posted-reports',
    '/api/reporter',
    '/api/responses',
    '/api/server'

  ];

  return <>
    <p>A list of server links:</p>

    <ul>
      {links.map(link =>
        <li key={link}><a href={`http://localhost:3001${link}`}>{link}</a></li>
      )}
    </ul>
  </>;
}

function mapStateToProps({ server: { agendas, drafts }}) {
  return { agendas, drafts }
};

export default connect(mapStateToProps)(Server)
