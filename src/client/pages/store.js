// visually display the contents of the Redux store

import React from 'react';
import { connect } from 'react-redux';
import JsonTree from 'react-json-tree';

const theme = {
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

function Store( { state }) {
  return <JsonTree data={state} sortObjectKeys={true} hideRoot={true} theme={theme} invertTheme={false}/>
}

function mapStateToProps(state, { table, id }) {
  if (!table) return { state } ;
  state = state[table];
  if (!id) return { state } ;
  if (Array.isArray(state)) {
    return { state: state[parseInt(id)] };
  } else {
    return { state: state[id]} ;
  }
};

export default connect(mapStateToProps)(Store)