
// visually display the contents of the Redux store

import React from 'react';
import { connect } from 'react-redux';
import { lookup } from '../store';

function mapStateToProps(state) {
  return {xref: lookup('xref')}
};

function Xref( { xref }) {
  return <>
    <p>References to Redux state in client views</p>

    <table class="table">
      <thead>
        <tr>
          <th>state</th>
          <th>sources</th>
        </tr>
      </thead>

      <tbody>
        {Object.entries(xref).map(([state, sources]) => (
           <tr key={state}>
             <td>
               <a href={`store/${state.replace(/[.]/g, '/')}`}>{state}</a>
             </td>

             <td>
               <ul>{sources.map(source => (
                 <li>
                   <a href={`https://github.com/apache/infrastructure-agenda/blob/master/src/client/${source}`}>{source}</a>
                 </li>
               ))}</ul>
             </td>
           </tr>
        ))}
      </tbody>
    </table>
  </>
}

export default connect(mapStateToProps)(Xref)
