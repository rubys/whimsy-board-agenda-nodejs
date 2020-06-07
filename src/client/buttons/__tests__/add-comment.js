import AddComment from '../add-comment.js';
import React from 'react';
import { Provider } from 'react-redux';
import { render, fireEvent, screen } from '@testing-library/react';
import store from '../../store';
import * as Actions from '../../../actions.js';

describe('comment form', () => {
  it("should enable Save button after input", async () => {
    store.dispatch(Actions.postServer({
      pending: { initials: 'sr' },
      user: { role: 'director' }
    }));

    render(<>
      <Provider store={store}>
        <AddComment item={{attach: 'A'}}/>
      </Provider>
    </>);

    // general modal form validation
    expect(document.querySelector('.modal#comment-form'))
      .not.toBe(null);
    expect(document.querySelector('.modal .modal-dialog .modal-header h4').textContent)
      .toBe('Enter a comment');
    expect(document.querySelector('.modal-body input').value)
      .toBe('sr');

    // initial state: no Delete button, Save is disabled
    expect([...document.querySelectorAll('#comment-form .modal-footer button')]
      .map(button => button.textContent))
      .not.toContain('Delete');
    expect([...document.querySelectorAll('#comment-form .modal-footer button')]
      .find(button => button.textContent === 'Save').disabled)
      .toBe(true);

    // Update comment
    fireEvent.change(screen.getByLabelText('Comment'), { target: { value: 'Good job!' } });

    // final state: Delete button present, Save is enabled
    expect([...document.querySelectorAll('#comment-form .modal-footer button')]
      .map(button => button.textContent))
      .toContain('Delete');
    expect([...document.querySelectorAll('#comment-form .modal-footer button')]
      .find(button => button.textContent === 'Save').disabled)
      .toBe(false);
  })
})
