import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const page = readFileSync(
  new URL('../src/pages/craftrush/index.astro', import.meta.url),
  'utf8',
);
const inline = page.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inline, 'Craft Rush handoff must keep one inline script');

function runHandoff({ save = null, clipboardWorks = true, execCopy = true } = {}) {
  const listeners = new Map();
  const elements = new Map();
  const assigned = [];
  let copied = '';
  let workerReads = 0;
  let cacheReads = 0;

  function element(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        hidden: id === 'recovery',
        href: '',
        value: '',
        checked: false,
        textContent: '',
        focus() {},
        select() {},
        addEventListener(type, listener) {
          listeners.set(`${id}:${type}`, listener);
        },
      });
    }
    return elements.get(id);
  }

  class PageURL extends URL {}
  PageURL.createObjectURL = () => 'blob:save';

  const storage = new Map();
  if (save !== null) storage.set('craftrush_save_v1', JSON.stringify(save));

  const sandbox = {
    Blob,
    Promise,
    URL: PageURL,
    btoa: (value) => Buffer.from(value, 'binary').toString('base64'),
    encodeURIComponent,
    unescape,
    document: {
      getElementById: element,
      execCommand: () => execCopy,
    },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
    },
    location: {
      origin: 'https://royashbrook.com',
      assign: (url) => assigned.push(url),
    },
    navigator: {
      clipboard: {
        writeText: async (text) => {
          if (!clipboardWorks) throw new Error('clipboard denied');
          copied = text;
        },
      },
      serviceWorker: {
        getRegistrations: async () => {
          workerReads += 1;
          return [];
        },
      },
    },
    caches: {
      keys: async () => {
        cacheReads += 1;
        return [];
      },
      delete: async () => true,
    },
  };
  sandbox.window = { caches: sandbox.caches };
  vm.runInNewContext(inline, sandbox);

  return {
    assigned,
    element,
    get copied() { return copied; },
    get workerReads() { return workerReads; },
    get cacheReads() { return cacheReads; },
    async event(id, type = 'click') {
      const listener = listeners.get(`${id}:${type}`);
      assert.ok(listener, `${id} must have a ${type} handler`);
      listener({ preventDefault() {} });
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    },
  };
}

test('a saved game never leaves until a portable copy succeeds', async () => {
  const app = runHandoff({ save: { level: 8, emeralds: 808 } });

  assert.equal(app.assigned.length, 0, 'the page must never auto-navigate');
  assert.equal(app.element('recovery').hidden, false);
  assert.equal(app.element('go').textContent, 'COPY SAVE & OPEN NEW HOME');
  assert.match(app.element('note').textContent, /Home Screen app/);

  await app.event('go');
  assert.match(app.copied, /^CR1\|/);
  assert.equal(app.assigned.length, 1);
  assert.match(app.assigned[0], /^https:\/\/craftrush\.royashbrook\.com\/#cr-migrate=/);
  assert.equal(app.workerReads, 0, 'the old offline worker remains a rescue copy');
  assert.equal(app.cacheReads, 0, 'the old offline files remain a rescue copy');
});

test('failed clipboard access requires explicit confirmation after a download attempt', async () => {
  const app = runHandoff({
    save: { level: 3, emeralds: 33 },
    clipboardWorks: false,
    execCopy: false,
  });

  await app.event('go');
  assert.equal(app.assigned.length, 0);
  assert.match(app.element('copyStatus').textContent, /NOT been copied/);

  await app.event('downloadSave');
  await app.event('go');
  assert.equal(app.assigned.length, 0, 'an iOS download click is not proof that a file exists');

  app.element('backupConfirm').checked = true;
  await app.event('backupConfirm', 'change');
  await app.event('go');
  assert.equal(app.assigned.length, 1);
});

test('a device without an old save waits for an explicit open', async () => {
  const app = runHandoff();

  assert.equal(app.assigned.length, 0);
  assert.equal(app.element('recovery').hidden, true);
  assert.equal(app.element('go').href, 'https://craftrush.royashbrook.com/');
  assert.match(app.element('msg').textContent, /now lives/);

  await app.event('go');
  assert.equal(app.assigned.length, 1);
  assert.equal(app.assigned[0], 'https://craftrush.royashbrook.com/');
});
