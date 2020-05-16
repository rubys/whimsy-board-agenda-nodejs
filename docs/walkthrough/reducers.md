# Agenda Reducer

[clockCounter.js](../../src/client/reducers/clockCounter.js)
is an example of a very simple reducer.

[agenda.js](../../src/client/reducers/agenda.js) is an
example of a considerably more complicated reducer.

Topics below cover some of the design considerations that
go into creating a reducer.

## Changing shape

If you compare the client cache view for the current agenda against the store
view of the agenda, the most obvious change is a change in shape.  The content
in the cache is a sequential array.  The content in the store is an object
indexed by `href`.  A field that isn't even present in the original source.

`href` is computed by from the `title`, with non alphanumeric characters being
translated ito a dash.  So the `href` for "Incubator" is "Incubator" and the
`href` for "Action Items" is "Action-Items".

`prev` and `next` values are added for each item.

`sortOrder` captures the original index.

## Merging data from multiple sources

The agenda reducer *listens* for actions not only on to agenda actions, but also
on minute and pending actions.

To ensure that updates aren't lost, select data is placed in a nested `status`
object, and that object is updated and grafted on to updated agendas.

For example, if the secretary marks a report as rejected, that information
goes into the `status` object for the associated item, and this update will
survive updates to the agenda itself.

This means that fields in the `status` object must be explicitly added or
removed.  By contrast, other fields in the agenda will track to what the
server provides.  If, for example, the server provides an update removing
a `warning`, that property will no longer be present in the updated status.

## Topic: equality

An important part of the architecture is that [reducers](./src/client/reducers)
and `mapStateToProps` funnctions must take care to ensure that the objects
don't change something actually changed, and more importantly that the objects
do change when something changes.  Equality is defined by shallow equals.

Consider:

    let a = { type: "counter", value: 1 };
    let b = a;
    b.value++;

The problem here is that `b` still strictly equals `a`.  Both refer to the
underlying data structure, and while that data structure did change, the
references did not.  Now let's look at a different implementation:

    let a = { type: "counter", value: 1 };
    let b = { ...a, value: a.value + 1 };

This uses the vintage 2018 JavaScript [spread
syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
to create a new object, copying all of the properties of the original object,
and overriding a single value.

With this approach, `a` and `b` are truly different.

It is important that the result of a reducer is to create new objects when there
is a change, and **not** modify the original state.  If the original objects are
changed, this can lead to React deciding that the new state matches the previous
state and not trigger re-rendering of components. 

## Deep Merge

This works both ways, and can lead to unnecessary re-rendering.

In the context of the agenda, consider that a person can make a change in
directly in SVN, with no machine readible information on what changed.
This will be parsed on the server, passed down to the client, and would
result in an entirely new set of objects on the client.

[src/client/deepMerge.js](../../src/client/deepMerge.js) helps by eliminating
unnecessary differences.  See also
[src/client/\_\_tests\_\_/deepMerge.js](../../src/client/__tests__/deepMerge.js).

With this in place, if the only change is that one report is approved,
the agenda, that one report, that report's status, and that report's
status approved_by property will be different, but all other reports
and properties will be the same.

Note: this is just an optimization.  Even if a component is unnecessarily
re-rendered, if the resulting virtual DOM is unchanged, the actual
DOM will not be affected.

## Computed values

Reports are considered accepted if five or more directors
approve the item.  At the present time, the board agenda
tool factors pending changes into this evaluation.  This
is effectively overridded in the secretary minutes the
report as being rejected.

These computations affect the `color` assigned to a report.

In an object-oriented implementation, these values would
be computed lazily via a method call.

In a reducer based architecture, these values are
pre-computed and updated as inputs change.  In the case of
`color` and the intermediate evaluations of properties
like `accepted`, generally most visits to the board agenda
tool will involve a visit to the index page, so these
values will need to be computed anyway.

From a debugging perspective, having this data readily
available, including intermediate calculations, is like
having the codebase augmented with `printf` or `console.log`
statements.

To ensure that these values are evaluatd consistently,
as well as to ensure that the *grafting* of previous
`status` objects onto updated agenda itmes is done
corectly, this logic is factored out into a module
private `status` function.

# Deferred reductions

At startup, `pending` values are received via a fetch to
`/api/server` before the agenda itself is fetched.  As
pending changes are associated with `attach` values (in
retrospect, probably a poor design choice) rather than
`href` values (also potentially unstable as titles are
edited), it is impossible to apply such actions until
an agenda is received.

What the code does in this case is to save the action
in a `pending_pending` variable and apply it later.