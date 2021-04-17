import Agenda from "../models/agenda.js";
import Minutes from "../models/minutes.js";
import ModalDialog from "../elements/modal-dialog.js";
import React, { useState, useCallback } from "react";
import jQuery from "jquery";
import { Flow, post } from "../utils.js";

function AddMinutes(props) {
  let [disabled, setDisabled] = useState(false);
  let [base, setBase] = useState('');
  let [ai_text, setAiText] = useState('');
  let [ai_owner, setAiOwner] = useState('');
  let [draft, setDraft] = useState('');
  let [indent, setIndent] = useState(0);
  let [checked, setChecked] = useState(false);

  let { item } = props;

  const ref = useCallback(node => {
    if (node) {
      // remove previous event handlers
      jQuery(node).off("show.bs.modal");
      jQuery(node).off("shown.bs.modal");

      // update form to match current item
      jQuery(node).on("show.bs.modal", () => {
        // reset base, draft minutes, shepherd, default ai_text, and indent
        let draft = Minutes.get(item.title);
        setBase(draft || "" );

        if (/^(8|9|1\d)\.$/m.test(item.attach)) {
          draft = draft || item.text
        } else if (!item.text) {
          setAiText(`pursue a report for ${item.title}`)
        };

        setDraft(draft);
        setAiOwner(item.shepherd);
        setIndent(/^\w+$/m.test(item.attach) ? 8 : 4);
        setChecked(item.rejected);
      });

      // autofocus on minute text
      jQuery(node).on("shown.bs.modal", () => {
        document.getElementById("minute-text").focus()
      })
    }
  }, [item]);

  // add an additional AI to the draft minutes for this item
  function addAI(event) {
    let $draft = draft;
    if ($draft) $draft += "\n";
    $draft += `@${ai_owner}: ${ai_text}`;

    setAiOwner(item.shepherd);
    setAiText('');
    setDraft($draft);
  };

  // determine if reflow button should be default or danger color
  function reflow_color() {
    let width = 78 - indent;

    if (!draft || draft.split("\n").every(line => (line.length <= width))) {
      return "btn-default"
    } else {
      return "btn-danger"
    }
  };

  function reflow() {
    setDraft(Flow.text(draft || "", new Array(indent + 1).join(" ")))
  };

  function save(event) {
    let text;

    switch (event.target.textContent) {
      case "Save":
        text = draft;
        break;

      case "Tabled":
        text = "tabled";
        break;

      case "Approved":
        text = "approved";
        break;

      default:
        text = "unknown";
    };

    let data = {
      agenda: Agenda.file,
      title: item.title,
      text,
      reject: checked
    };

    setDisabled(true);

    post("minute", data, (minutes) => {
      Minutes.load(minutes);
      setDisabled(false);
      jQuery("#minute-form").modal("hide");
      document.body.classList.remove("modal-open")
    })
  };

  function reject(event) {
    let data = {
      agenda: Agenda.file,
      title: item.title,
      text: base,
      reject: !checked
    };

    post("minute", data, minutes => Minutes.load(minutes));
    setChecked(!checked)
  }

  return <ModalDialog ref={ref} id="minute-form" className="wide-form" color="commented">
    <h4 className="commented">Minutes</h4>

    {item.comments.length === 0 ? <textarea id="minute-text" className="form-control" rows={17} tabIndex={1} placeholder="minutes" value={draft} /> : <>
      <textarea id="minute-text" className="form-control" rows={12} tabIndex={1} placeholder="minutes" value={draft} />
      <h3>Comments</h3>

      <div id="minute-comments">
        {item.comments.map(comment => <pre className="comment">{comment}</pre>)}
      </div>
    </>}

    <div className="row" style={{ marginTop: "1em" }}>
      <button className="col-md-1 col-md-offset-1 btn-info btn-sm btn" onClick={addAI} disabled={!ai_owner || !ai_text}>+ AI</button>

      <label className="col-md-2">
        <select value={ai_owner}>
          {Minutes.attendee_names.map(name => <option>{name}</option>)}
        </select>
      </label>

      <textarea className="col-md-7" value={ai_text} rows={1} cols={40} tabIndex={2} />
    </div>

    {/^[A-Z]+$/m.test(item.attach) ? <input id="flag" type="checkbox" label="report was not accepted" onClick={reject} checked={checked} /> : null}

    <button className="btn-default" type="button" data-dismiss="modal" onClick={() => (
      setDraft(base)
    )}>Cancel</button>

    {base ? <button className="btn-warning" type="button" onClick={() => (
      setDraft('')
    )}>Delete</button> : null}

    {/^3\w/m.test(item.attach) ? <>
      <button className="btn-warning" type="button" onClick={save} disabled={disabled}>Tabled</button>
      <button className="btn-success" type="button" onClick={save} disabled={disabled}>Approved</button>
    </> : null}

    <button className={reflow_color()} onClick={reflow}>Reflow</button>
    <button className="btn-primary" type="button" onClick={save} disabled={disabled || base === draft}>Save</button>
  </ModalDialog>
};

AddMinutes.button = {
  text: "add minutes",
  className: "btn-primary",
  data_toggle: "modal",
  data_target: "#minute-form"
};

export default AddMinutes
