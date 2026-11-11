const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');

const source = readFileSync(__dirname + '/gallery.js', 'utf8');
const start = source.indexOf('function parseGalleryLocation(');
const end = source.indexOf('\nfunction readGalleryLocation(', start);
const parse = runInNewContext(source.slice(start, end) + '\nparseGalleryLocation;', {
  URLSearchParams, pageSizes: [4, 6, 8, 10, 12]
});
const state = search => JSON.parse(JSON.stringify(parse(search)));

test('restores each view with its own page and size defaults', () => {
  assert.deepEqual(state(''), {view: 'grid', page: 1, size: 6});
  assert.deepEqual(state('?view=list'), {view: 'list', page: 1, size: 4});
  assert.deepEqual(state('?view=slider'), {view: 'slider', page: 1, size: 1});
});

test('accepts shared pages, loaded List batches, and Slider positions', () => {
  assert.deepEqual(state('?view=list&page=3&pageSize=4&anime=Death+Note'), {view: 'list', page: 3, size: 4});
  assert.deepEqual(state('?view=grid&page=2&pageSize=10&q=Hokusai'), {view: 'grid', page: 2, size: 10});
  assert.deepEqual(state('?view=slider&page=5&pageSize=12'), {view: 'slider', page: 5, size: 1});
});

test('retains legacy Grid URLs without a view parameter', () => {
  assert.deepEqual(state('?page=2&pageSize=8'), {view: 'grid', page: 2, size: 8});
});

test('rejects unknown views, unsupported sizes, and invalid page numbers', () => {
  assert.deepEqual(state('?view=unknown&page=-3&pageSize=5'), {view: 'grid', page: 1, size: 6});
  for (const page of ['0', '1.5', 'NaN', 'Infinity', '9007199254740992']) {
    assert.deepEqual(state('?view=list&page=' + page + '&pageSize=bad'), {view: 'list', page: 1, size: 4});
  }
});
