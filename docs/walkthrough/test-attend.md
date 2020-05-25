# Testing the "attend" server side operation

When viewing the "Roll Call" page of a given agenda, a button will appear
at the bottom of the page which enables the user to indicate whether they
are intending to go to the meeting or need to send their regrets.

If the user is not currently listed on the page, the button will read
*attend* and pressing it will add that user to the agenda.

If the user is currently listed on the page, the button will read
*regrets* and pressing it will remove that user from the agenda.

The client side of this operation is implemented in
[src/client/buttons/attend.js](../../src/client/buttons/attend.js).
It is relatively straightforward:

 * There is an `attending` getter which will determine whether or not
   the user is currently listed as attending.
 * The `render` method will return a single button with text based on
   the value of `this.attending`, and associated with an `onClick`
   handler.
 * The `onClick` method will collect up the name of the agenda file,
   the user's name and id, and determine the `action` requested
   based on the value of `this.attending`.

The server side of this operation is implemented in
[src/server/operations/attend.js](../../src/server/operations/attend.js).
It is somewhat **less** straightforward.

We are dealing with the need to update a text based format without a formal
grammar.  This is currently implemented with powerful, but error prone,
regular expressions.

In general, the operation involves one or both of removing the name from
where it currently it listed, and adding the name in the list where it
belongs.

As there are three separate types of attendees (Directors, Executive
Officers, and Guests) and two types of actions (attend, regrets), there
are six major code paths.

## Mocking

For testing purposes, we don't want to use live data from subversion
repositories, as that would affect the results.  Instead we use test
data from
[src/server/__mocks__/svn/foundation_board](../../src/server/__mocks__/svn/foundation_board)
which has been santized to remove private data and adjusted as needed
to enable each of the test scenarios to be implemented.

[src/server/__mocks__/svn.js](../../src/server/__mocks__/svn.js) contains
a [manual mock](https://jestjs.io/docs/en/manual-mocks) which replaces
the methods that would normally interact with subversion with code that
reads from the test data directories, and captures and reguritates updates
in memory rather than writing them to disk.

A `reset` method is provided to enable clearing of updates between tests.

## Test Suite

The test suite itself is contained in
[src/server/operations/__tests__/attend.js](../../src/server/operations/__tests__/attend.js)
and contains six tests.

Each test contains three parts:

  * The construction of a request body that contains the `agenda`, 'action`,
    and `name` that is to be tested.
  * The call to the `attend` operation, passing the request, and extracting
    the parsed agenda that is returned.
  * One or more calls to the Jest [expect](https://jestjs.io/docs/en/expect)
    function that determines if the results match expectations.

At the top of the file is
  * A call to `jest.mock` that replaces the `import` with the mock replacement.
  * A call to `afterEach` which ensures that the `Board` updates are discarded
    between tests.
  * A call to `afterAll` which ensures that LDAP is closed.  LDAP isn't
    currently mocked in this test, and agenda parsing will issue LDAP requests,
    and unless the connection is closed, the test will not immediately complete,
    instead it will eventually time out with an error.

# Execution

Tests are run via the following command:

    yarn test

Jest provides a large number of command line
[options](https://jestjs.io/docs/en/cli#using-with-yarn).
Most notably, it will default to
[--watch](https://jestjs.io/docs/en/cli#--watch) files for changes
and it will automatically rerun tests related to the change.