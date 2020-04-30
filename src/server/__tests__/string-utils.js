import { word_wrap, reflow } from '../string-utils.js';

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

test('wraps long lines', () => {
  let output = word_wrap(loremIpsum.replace(/\n/g, ' ')).split("\n");
  expect(output.length).toBe(6);
  expect(Math.max(...output.map(line => line.length)))
    .toBeLessThanOrEqual(80);
});

test('reflows paragraphs', () => {
  let output = reflow(`${loremIpsum.replace(/\s/g, "\n")}\n\n${loremIpsum}`, 10, 30);
  let [paragraph1, paragraph2] = output.split(/\n\s*\n/);
  expect(paragraph1).toEqual(paragraph2);

  let lines = output.split("\n");
  expect(lines[0]).toBe('          Lorem ipsum dolor sit amet,');
  expect(lines[1]).toBe('          consectetur adipiscing elit,');
});
