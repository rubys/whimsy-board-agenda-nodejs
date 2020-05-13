# Adding a comment to a PMC report

In general, you should be able to add a new form by cloning this module,
changing the few things that need to be changed, and adding the button
to the appropriate place in the [client router](../../src/client/router.js).

Doing this successfully requires a knowledge of the
[React Component lifecycle](https://reactjs.org/docs/react-component.html#the-component-lifecycle),
[Boostrap Modal events](https://getbootstrap.com/docs/4.0/components/modal/#events),
and the [client router](../../src/client/router.js).

There are three parts to adding a comment to a report:

  - the button
  - the form
  - the operation

### The button

In addition to determining what React Component to use and what
agenda item to pass to that component, the
[client router](../../src/client/router.js) determines what
buttons to show in the footer.  It is not concerned with buttons
that may show in the main area, only those that appear in the
footer.

The <tt>add comment</tt> button is an example of such a button.

The router passes the list of buttons to be shown to the
[Main layout component](../../src/layout/main.js).

The main component deals with two types of buttons: those with
associated forms (like the add comment button), and those that
stand alone (like the approve and attend buttons).

It passes both sets of buttons to the
[Footer layout component](../../src/layout/footer.js) for the
rendering of the button itself.

For buttons with forms, the button has four properties, and
these are defined in the `static get button` method of the
component.  For <tt>add comment</tt> this file can be found
in [src/buttons/add-comment.js](src/buttons/add-comment.js).

The properties are:

  - **text**: the text that shows in the button.  The router can
    override this value based on state.  In this case, the router
    will change the text to `edit comment` if there is a pending
    comment that has yet to be committed.
  - **className**: a CSS class name that determines the color
    of the button.  These values are provided by
    [bootstrap](https://getbootstrap.com/docs/4.0/components/buttons/#examples).
  - **data_toggle**: for modal dialogs, this is <tt>"modal"</tt>.
  - **data_target**: the HTML id attribute of the form to be
    shown when the button is pressed.

The Main component renders the form itself
as a hidden modal dialog immediately after the footer.

### The form

The form is defined in the same
[src/buttons/add-comment.js](src/buttons/add-comment.js) module.
It needs to implement a
[bootstrap modal dialog](https://getbootstrap.com/docs/4.0/components/modal/)
with an id that matches the <tt>data_target</tt> property of
the button.

Implementing such a form requires a large number of `<div>` elements.
The board agenda tool provides a `ModalDialog` component that helps
with this.  Instead of separating things into a header, body, and footer
and quadruple (or more!) wrapping each in `<div>` elements, one merely
defines a list of elements, and `ModalDialog` will place the header
elements in the header, the button elements in the footer, and the rest
in the body.  In addition for form elements that contain a `label`
property and `id` element, the label will be extracted and used to
create an separate element, with both wrapped in (yet another!)
`<div>` element.

It is important to realize that as you traverse from report to report
in the agenda React will reuse the hidden form and button.  This means
that unless you hook into an lifecycle or dialog event, the state
will not be updated to reflect the new component.

Bootstrap provides a number of
[events](https://getbootstrap.com/docs/4.0/components/modal/#events)
that will be fired at various points.  We can use `show.bs.modal`
and `shown.bs.modal` to initialize state when the form is about to
be shown, and to set the focus once the form is shown.  The listeners
for these events can be set up in React's
[componentDidMount](https://reactjs.org/docs/react-component.html#componentdidmount)
lifecycle method.

React has two types of form components:
[controlled](https://reactjs.org/docs/forms.html#controlled-components)
and
[uncontrolled](https://reactjs.org/docs/uncontrolled-components.html).

Controlled components have a `value` and `onChange` and `onClick`
properties that invoke methods that change state that trigger a 
rerendering of the component that updates the value for that field.

Uncontrolled components have a `defaultValue` but are otherwise
left alone by React.  In order to retrieve the value of such fields
you will need to use DOM manipulation APIs, such as
`document.getElementById("comment-initials").value`.

The `AddComment` component uses both techniques: uncontrolled for
the initials and controlled for the rest.

Buttons with a `data-dismiss="modal"` property will dismiss the
dialog.  Buttons with an `onClick` property will involve the
function indicated when the button is pressed.

Functions triggered by an event will generally set component
state and optionally issue HTTP POST requests and/or
dispatch actions to update the Redux store (often based on
responses to POSt requests).

Such functions can dismiss the modal entirely by executing:

    jQuery("#comment-form").modal("hide");
    document.body.classList.remove("modal-open");

This component also demonstrates buttons that enable or
disable based on conditions, and even buttons that disappear
or reappear entirely based on conditons.

### The operation

The [server router](../../src/server/router.js) routes
HTTP POST requests for `/api/comment` to
[src/server/operations/comment.js](../../src/server/operations/comment.js).

Parsed JSON POST data is provided in `request.body`.

Return values are serialized as JSON and sent as the response.

Errors are captured and dealt with by providing a server error HTTP status code and a stack traceback.

In the case of adding a comment, the comment itself is
added (or removed) from a YAML file, and the updated
results are returned to the client.  A conveience method
named `Pending.update` takes care of the details.





