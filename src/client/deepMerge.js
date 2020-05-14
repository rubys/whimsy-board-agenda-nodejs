// intelligently merges two objects
//
// Graft portions of the source object into the target, or even return the original source
// object in its entirely, in order to make the every portion of the result strictly equal
// (in the sense of Object.is() returns true) if and only if the source and targets are
// deeply equal for these portions.
//
// Use case: somebody modifies an agenda using a text editor and checks in the result to
// svn using the command line.  After parsing, large portions of the agenda are the
// same, but perhaps only one item as changed or inserted, or alternately multiple items
// were approved but were otherwise unchanged.

export default function deepMerge(source, target) {
  if (!source || source === target) return target;

  if (Array.isArray(source)) {
    if (!Array.isArray(target)) return target;
    let changed = false;

    for (let i in target) {
      target[i] = deepMerge(source[i], target[i]);
      changed = changed || target[i] !== source[i];
    }

    if (!changed && Object.keys(source).length === Object.keys(target).length) return source;
  } else if (typeof source === 'object') {
    if (typeof target !== 'object') return target;
    let changed = false;

    for (let i in target) {
      target[i] = deepMerge(source[i], target[i]);
      changed = changed || target[i] !== source[i];
    }

    if (!changed &&source.length === target.length) return source;
  }

  return target;
}