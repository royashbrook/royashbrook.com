import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from '../worker/index.js';
import { readJson, BodyTooLarge } from '../worker/read-json.js';

const env = {
  TOOL_REQUESTS: { limit: async () => ({ success: true }) },
  ASSETS: { fetch: async () => new Response('missing', { status: 404 }) },
};
const message = { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'get_skill' } };
const post = (body) => new Request('https://example.test/new-tool', { method: 'POST', body });

test('oversized batches dispatch no tool calls and the boundary remains usable', async (t) => {
  let reads = 0;
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url.startsWith('https://api.github.com/')) return Response.json([{ name: 'new-tool', topics: ['royashbrook-tool'], default_branch: 'main', html_url: 'https://github.com/example/new-tool' }]);
    reads++;
    return new Response('the skill');
  });
  const rejected = await worker.fetch(post(JSON.stringify(Array(17).fill(message))), env);
  assert.equal(rejected.status, 413);
  assert.equal(rejected.headers.get('access-control-allow-origin'), '*');
  assert.equal(reads, 0);
  for (const count of [1, 15, 16]) {
    const response = await worker.fetch(post(JSON.stringify(Array(count).fill(message))), env);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).length, count);
  }
  assert.equal(reads, 32);
  const notification = await worker.fetch(post(JSON.stringify([{ method: 'notifications/initialized' }])), env);
  assert.equal(notification.status, 202);
});

test('streamed byte limit ignores missing or dishonest Content-Length and cancels input', async () => {
  for (const length of [undefined, '1']) {
    let cancelled = false;
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('"é'));
        controller.enqueue(new TextEncoder().encode('é"'));
      },
      cancel() { cancelled = true; },
    });
    const request = new Request('https://example.test', { method: 'POST', body, duplex: 'half', headers: length ? { 'content-length': length } : {} });
    await assert.rejects(readJson(request, 5), BodyTooLarge);
    assert.equal(cancelled, true);
  }
  assert.equal(await readJson(post('"éé"'), 6), 'éé');
  await assert.rejects(readJson(post('{'), 64), SyntaxError);
});

test('oversized HTTP body is rejected before any skill fetch', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.ok(url.startsWith('https://api.github.com/'));
    return Response.json([{ name: 'new-tool', topics: ['royashbrook-tool'] }]);
  });
  const result = await worker.fetch(post(JSON.stringify({ ...message, padding: 'x'.repeat(65536) })), env);
  assert.equal(result.status, 413);
});

test('all dynamic tool paths and methods share a client allowance before registry access', async (t) => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('must not reach GitHub'); });
  const keys = [];
  const blocked = { ...env, TOOL_REQUESTS: { limit: async ({ key }) => { keys.push(key); return { success: false }; } } };
  for (const path of ['/new-tool', '/new-tool/', '//new-tool//', '/another-tool']) {
    for (const method of ['GET', 'POST', 'HEAD', 'OPTIONS']) {
      const result = await worker.fetch(new Request(`https://example.test${path}`, { method, headers: { 'cf-connecting-ip': '192.0.2.1' } }), blocked);
      assert.equal(result.status, 429);
      assert.equal(result.headers.get('retry-after'), '60');
    }
  }
  assert.deepEqual([...new Set(keys)], ['192.0.2.1']);
});
