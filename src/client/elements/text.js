import { htmlEscape } from "../utils.js";
import React from "react";

//
// Escape text for inclusion in HTML; optionally apply filters
//
export default function Text(props) {
  let text = htmlEscape(props.raw || "");

  if (props.filters) {
    for (let filter of props.filters) {
      text = filter(text)
    }
  };

  return <span dangerouslySetInnerHTML={{__html: text}}/>
};
