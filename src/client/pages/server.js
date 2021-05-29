// visually display the contents of the Redux store

import React from 'react';
import { connect } from 'react-redux';

function mapStateToProps({ server: { agendas, drafts, env } }) {
  return { agendas, drafts, env }
};

function Server({ agendas, drafts, env }) {

  let links = [
    ...agendas.map(agenda => `/api/${agenda.match(/\d+_\d+_\d+/)[0].replace(/_/g, "-")}.json`),
    ...drafts.map(draft => `/api/${draft.match(/\d+_\d+_\d+/)[0].replace(/_/g, "-")}.txt`),
    '/api/calendar',
    '/api/committers',
    '/api/committee-info',
    '/api/historical-comments',
    '/api/jira',
    ...agendas.map(agenda => `/api/minutes/${agenda.match(/\d+_\d+_\d+/)[0].replace(/_/g, "-")}.json`),
    '/api/podling-name-search',
    '/api/posted-reports',
    '/api/potential-actions',
    '/api/reporter',
    '/api/responses',
    '/api/server',
    ...(env === 'development' ? ['/api/websocket'] : []),
    '/api/xref',
  ];

  let base = (env === 'production') ? '' : 'http://localhost:3001';

  return <>
    <p>A list of server links:</p>

    <ul>
      {links.map(link =>
        <li key={link}><a href={`${base}${link}`}>{link}</a></li>
      )}
    </ul>
  </>;
};

export default connect(mapStateToProps)(Server)
