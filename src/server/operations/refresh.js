//
// refresh agenda from svn; undo any fork that may have been done.
//
import { reset, Board } from "../svn.js";
import { read } from "../sources/agenda.js";

export default async function refresh(request) {
  let { agenda } = request.body;

  if (process.env.NODE_ENV === 'development') {
    await reset();
  };

  await Board.update(request, 0);

  return {agenda: await read(agenda, request)};
}
