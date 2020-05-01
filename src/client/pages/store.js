// visually display the contents of the Redux store

import React from 'react';
import { connect } from 'react-redux';
import JsonTree from 'react-json-tree';
import { lookup } from '../store';

export const theme = {
  scheme: "Github",
  author: "Defman21",
  base00: "#ffffff",
  base01: "#f5f5f5",
  base02: "#c8c8fa",
  base03: "#969896",
  base04: "#e8e8e8",
  base05: "#333333",
  base06: "#ffffff",
  base07: "#ffffff",
  base08: "#ed6a43",
  base09: "#0086b3",
  base0A: "#795da3",
  base0B: "#183691",
  base0C: "#183691",
  base0D: "#795da3",
  base0E: "#a71d5d",
  base0F: "#333333"
};

function mapStateToProps(state, { table, id }) {
  // lookup items that are missing
  for (let property in state) {
    if (state[property] === null) lookup(property);
  }

  // if table (and possibly id) are specified (generally from the URL), drill down
  // to that portion of the state
  if (!table) return { state } ;
  state = state[table];
  if (!id) return { state } ;
  if (Array.isArray(state)) {
    return { state: state[parseInt(id)] };
  } else {
    return { state: state[id]} ;
  }
};

function Store( { state }) {
  return <JsonTree data={state} sortObjectKeys={true} hideRoot={true} theme={theme} invertTheme={false}/>
}

export default connect(mapStateToProps)(Store)