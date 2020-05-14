# Redux Store

Following is a description of the data contained in the Redux store.

Each of the following item is associated with a
[reducer](../../src/client/reducers/).

## agenda

This contains the agenda, but instead of a flat array, it is indexed by
href, with the original array index saved as a `sortOrder` property.

Other key changes:

  * an `href` attribute, which essentially is the `title` with non-alphanumeric
    characters replaced with a dash.
  * `next` and `prev` properties that enable traversal through the list.
  * `comments` is an array (this change should eventually be done on the server)
  * `special_orders` will contain the hrefs of special orders that relate to this
    report.  (not currently working)
  * `non_reponsive` indicates that the report was missing or rejected two or more
    consecutive months.
  * `cc` is set to `operations@apache.org` for president reports, and 
    `board@apache.org` for the rest.
  * A `status` object containing data from a number of sources:
    - `flagged_by`, `approved_by`, and `missing` from the agenda.
    - `pending : {comments, approved, unapproved, flagged, unflagged}` from pending.
    - `minutes`, `rejected` from secretary's minutes.
    - `color` a computed color for the item based on the status.  This corresponds
      to a CSS class found in [agenda.css](../../src/client/agenda.css).

## client

This contains various information *about* the current agenda, things like
`agendaFile` name and `meetingDate`.

It contains status of the meeting itself, such as `meetingDay` (i.e., are we past
the point of 24 hours before the meeting or not), `meetingStarted` and `meetingComplete`.
This data is extracted from the agenda and minutes.  Having it here in one place
means that the various components don't have to be concerned with how this information
is obtained.

It contains the `offline` status.  Once that status is implemented, there likely will
be a `pending` structure here that mirrors the `pending` structure found in the
server section of the Redux store.

## clockCounter

A simple counter of the number of background HTTP requests that have yet to complete.
Used to control the display of an hourglass in the header.

Background actions are for things like historical comments - not explicitly made by
the user by the pressing of a button (which would be disabled while the request
is processing).

## historialComments

12 month history of comments made against reports in the agenda, as received
by the server.  This data is indexed by report title, then by date.

## reporter

Draft reports being prepared by [reporter.apache.org](https://reporter.apache.org).
This data is indexed by report title.

## responses

A count of email responses to board report feedback sent by the secretary after
every board meeting.  This data is indexed by report title, then by date.

## server

This contains information about the server state that the client may need to
know.

 * `agendas` is the list of board_agenda_xxxx_xx_xx.txt files in
   [private/foundation/board](https://svn.apache.org/repos/private/foundation/board).
 * `digests` is the md5 digest of files in places like `work/cache`.
 * `directors` is "intials" and first name of each director.
 * `drafts` is the list of board_minutes_xxxx_xx_xx.txt files in
   [private/foundation/board](https://svn.apache.org/repos/private/foundation/board)
 * `env` is the running environment - `development`, `test`, or `production`.
 * `forked` indicates whether the server code is running off of local repositories
   (true), or against apache infrastructure (false).
 * `online` indicates who is in the production instance of the board agenda
   application.  Used by chat.
 * `pending` indicates comments, approvals, flags, etc. that have not yet been
   committed.
 * `session` is a security token that is used to authenticate with the web socket.
 * `user` is information about yourself: your `firstname`, `initials`, `role`, etc.
 * `webSocket` is the URL to be used to connect to the websocket.