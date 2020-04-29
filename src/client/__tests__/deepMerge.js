import deepMerge from '../deepMerge.js';

test('intelligently merges two object', () => {

  let source = {a: [1, 2, {b: {c: 1, d: 1}}, {e: {f: 1, g: 1}}]};
  let target = {a: [1, 2, {b: {c: 1, d: 2}}, {e: {f: 1, g: 1}}]};
  //                                    ^ only difference
  let result = deepMerge(source, target);

  expect(source).not.toBe(result);
  expect(source.a).not.toBe(result.a);
  expect(source.a[0]).toBe(result.a[0]);
  expect(source.a[1]).toBe(result.a[1]);
  expect(source.a[2]).not.toBe(result.a[2]);
  expect(source.a[3]).toBe(result.a[3]);
})
