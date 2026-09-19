import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from '../worker/index.js';

const TOOL_REQUESTS = { limit: async () => ({ success: true }) };

test('static pages do not depend on the tool registry', async (t) => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('must not reach GitHub'); });
  const env = { ASSETS: { fetch: async () => new Response('page') } };
  for (const path of ['/', '/projects/', '/blog/', '/skills/']) {
    const result = await worker.fetch(new Request(`https://example.test${path}`), env);
    assert.equal(await result.text(), 'page');
  }
});

test('inherited names use the ordinary asset 404', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json([]));
  for (const name of ['constructor', 'toString', '__proto__']) {
    let calls = 0;
    const env = { TOOL_REQUESTS, ASSETS: { fetch: async () => { calls++; return new Response('missing', { status: 404 }); } } };
    const result = await worker.fetch(new Request(`https://example.test/${name}`, { headers: { accept: 'text/html' } }), env);
    assert.equal(result.status, 404);
    assert.equal(calls, 1);
  }
});

test('tool discovery retains browser redirects and JSON-RPC', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json([{ name: 'example', html_url: 'https://github.com/example/tool', default_branch: 'main', topics: ['royashbrook-tool'] }]);
  });
  const env = { TOOL_REQUESTS, ASSETS: { fetch: async () => new Response('missing', { status: 404 }) } };
  const browser = await worker.fetch(new Request('https://example.test/example', { headers: { accept: 'text/html' } }), env);
  assert.equal(browser.status, 302);
  assert.equal(browser.headers.get('location'), 'https://github.com/example/tool');
  const rpc = await worker.fetch(new Request('https://example.test/example', { method: 'POST', body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) }), env);
  assert.equal((await rpc.json()).result.tools[0].name, 'get_skill');
});

test('registry failure preserves the asset fallback', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new DOMException('timeout', 'TimeoutError'); });
  const env = { TOOL_REQUESTS, ASSETS: { fetch: async () => new Response('missing', { status: 404 }) } };
  assert.equal((await worker.fetch(new Request('https://example.test/missing'), env)).status, 404);
});
