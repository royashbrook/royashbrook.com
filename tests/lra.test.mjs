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

test('root and unknown paths go home with a 302', async () => {
  for (const p of ['/', '/nope']) {
    const r = await go(p);
    assert.equal(r.status, 302);
    assert.equal(r.headers.get('location'), 'https://royashbrook.com/');
  }
});
