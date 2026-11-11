import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { links } from '../lra/worker.js';
import { games } from '../src/data/games.js';

const go = (path) => worker.fetch(new Request(`https://lra.sh${path}`));

test('every listed game has a short link to its play url', () => {
  assert.equal(Object.keys(links).length, games.length);
  for (const g of games) assert.ok(Object.values(links).includes(g.play), g.name);
});

test('a game slug is a 301 to the game', async () => {
  const r = await go('/zap');
  assert.equal(r.status, 301);
  assert.equal(r.headers.get('location'), 'https://zap.royashbrook.com/');
});

test('a slug ignores case and a trailing slash', async () => {
  assert.equal((await go('/Zap/')).headers.get('location'), 'https://zap.royashbrook.com/');
});

test('the root lists every link and its target', async () => {
  const r = await go('/');
  assert.equal(r.status, 200);
  const html = await r.text();
  for (const [s, to] of Object.entries(links)) {
    assert.ok(html.includes(`href="/${s}"`), s);
    assert.ok(html.includes(`href="${to}"`), to);
  }
});

test('an unknown path gets the list with a 404', async () => {
  const r = await go('/nope');
  assert.equal(r.status, 404);
  assert.ok((await r.text()).includes('href="/zap"'));
});
