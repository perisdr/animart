const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const source = readFileSync(__dirname + '/featured.js', 'utf8');
const records = JSON.parse(readFileSync(__dirname + '/../data/wallpapers.json', 'utf8'));

function setup({values = [0], fallback, failFirst = false} = {}) {
  let fetches = 0, draws = 0;
  const preloads = [];
  const window = {crypto: fallback === undefined ? {getRandomValues(array) {
    assert.ok(draws < values.length, 'Unexpected extra random draw');
    array[0] = values[draws++];
  }} : undefined};
  runInNewContext(source, {
    window, Uint32Array, encodeURI,
    Math: fallback === undefined ? Math : {random: () => fallback, floor: Math.floor},
    fetch: async () => {
      fetches++;
      if (failFirst && fetches === 1) throw Error('Offline');
      return {ok: true, json: async () => records.slice()};
    },
    document: {
      createElement: () => ({setAttribute(name, value) {this[name] = value;}}),
      head: {append: link => preloads.push(link)}
    }
  });
  return {api: window.animartFeatured, preloads, fetches: () => fetches, draws: () => draws};
}

test('every catalogue entry is reachable, including the final accepted bucket', async () => {
  const limit = Math.floor(2 ** 32 / records.length) * records.length;
  for (let index = 0; index < records.length; index++) {
    const {api} = setup({values: [limit - records.length + index]});
    assert.equal((await api.load()).featured.id, records[index].id);
  }
});

test('rejects the incomplete bucket instead of biasing the first entries', async () => {
  const limit = Math.floor(2 ** 32 / records.length) * records.length;
  const state = setup({values: [limit, 0xffffffff, records.length - 1]});
  assert.equal((await state.api.load()).featured.id, records.at(-1).id);
  assert.equal(state.draws(), 3);
});

test('preload and gallery share a single fetch and selection', async () => {
  const state = setup({values: [3]});
  const first = await state.api.load();
  assert.equal(await state.api.load(), first);
  assert.equal(state.fetches(), 1);
  assert.equal(state.preloads.length, 1);
  assert.equal(state.preloads[0].imagesrcset, state.api.srcset(first.featured));
  assert.equal(state.preloads[0].imagesizes, state.api.sizes);
  assert.equal(state.preloads[0].fetchpriority, 'high');
});

test('older-browser fallback can select both ends of the catalogue', async () => {
  for (const [fallback, index] of [[0, 0], [0.999999, records.length - 1]]) {
    const {api} = setup({fallback});
    assert.equal((await api.load()).featured.id, records[index].id);
  }
});

test('failed early fetch can be retried', async () => {
  const state = setup({failFirst: true});
  await assert.rejects(state.api.load(), /Offline/);
  assert.equal((await state.api.load()).records.length, records.length);
  assert.equal(state.fetches(), 2);
  assert.equal(state.preloads.length, 1);
});
