const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');

const source = readFileSync(__dirname + '/gallery.js', 'utf8');
const start = source.indexOf('function paginationPages(');
const end = source.indexOf('\nfunction pageLink(', start);
const pages = runInNewContext(source.slice(start, end) + '\npaginationPages;');
const sequence = (total, current) => Array.from(pages(total, current));

test('shows every page when there are at most five intermediate pages', () => {
  assert.deepEqual(sequence(1, 1), [1]);
  assert.deepEqual(sequence(7, 4), [1, 2, 3, 4, 5, 6, 7]);
});

test('collapses long ranges while retaining the first and last three pages', () => {
  assert.deepEqual(sequence(12, 1), [1, 2, 3, null, 10, 11, 12]);
  assert.deepEqual(sequence(12, 12), [1, 2, 3, null, 10, 11, 12]);
  assert.deepEqual(sequence(20, 10), [1, 2, 3, null, 9, 10, 11, null, 18, 19, 20]);
});

test('never hides the current page or uses an ellipsis for a single skipped page', () => {
  for (let total = 1; total <= 100; total++) {
    for (let current = 1; current <= total; current++) {
      const result = sequence(total, current);
      const numbers = result.filter(page => page !== null);
      assert.equal(numbers[0], 1);
      assert.equal(numbers.at(-1), total);
      assert.ok(numbers.includes(current));
      if (current > 1) assert.ok(numbers.includes(current - 1));
      if (current < total) assert.ok(numbers.includes(current + 1));
      assert.equal(new Set(numbers).size, numbers.length);
      assert.deepEqual(numbers, [...numbers].sort((a, b) => a - b));
      result.forEach((page, index) => {
        if (page === null) assert.ok(result[index + 1] - result[index - 1] > 2);
      });
    }
  }
});
