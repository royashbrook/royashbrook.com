// royashbrook.com worker.
// serves a per-tool discovery MCP at royashbrook.com/<toolname> for every public repo tagged
// `royashbrook-tool` (e.g. /hush, /trustmebro, /sql-spider). everything else falls through to the
// static astro site (the ASSETS binding).
//
// the registry IS the github topic: tag a repo -> royashbrook.com/<name> works automatically, no
// redeploy. routing reads the direct repos API (not github search, which lags on new topics),
// edge-caches it, and fails OPEN (any github hiccup just falls through to the site, never breaks it).
//
// each /<tool> endpoint: an agent (POST JSON-RPC) gets that tool's MCP -> get_skill returns its
// SKILL.md so the agent can install + use it. a human (browser GET) gets a 302 to the github repo.

const OWNER = 'royashbrook';
const TOPIC = 'royashbrook-tool';
const UA = 'royashbrook.com-mcp';
const VERSION = '1.0.0';
const PROTOCOL_VERSION = '2025-06-18';
const CACHE = { cacheTtl: 300, cacheEverything: true };
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type, mcp-protocol-version',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const seg = url.pathname.split('/').filter(Boolean);
    if (seg.length === 1) {
      let reg = null;
      try { reg = await registry(); } catch { reg = null; } // fail open -> static site
      if (reg && reg[seg[0]]) return toolEndpoint(seg[0], reg[seg[0]], request);
    }
    return env.ASSETS.fetch(request);
  },
};

// ---------- registry: the `royashbrook-tool` topic -> { slug: {description, repo, branch} } ----------
async function registry() {
  const r = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100`, {
    headers: { 'User-Agent': UA, Accept: 'application/vnd.github+json' },
    cf: CACHE,
  });
  if (!r.ok) throw new Error(`github repos api ${r.status}`);
  const out = {};
  for (const x of await r.json()) {
    if (Array.isArray(x.topics) && x.topics.includes(TOPIC) && !x.archived && !x.private) {
      out[x.name] = { description: x.description || '', repo: x.html_url, branch: x.default_branch };
    }
  }
  return out;
}

async function getSkill(slug, info) {
  for (const file of ['SKILL.md', 'AGENTS.md', 'README.md']) {
    const u = `https://raw.githubusercontent.com/${OWNER}/${slug}/${info.branch}/${file}`;
    const r = await fetch(u, { headers: { 'User-Agent': UA }, cf: CACHE });
    if (r.ok) return `# ${slug} (${file})\n# repo: ${info.repo}\n# install: git clone ${info.repo}\n# source: ${u}\n\n${await r.text()}`;
  }
  throw new Error(`no SKILL.md / AGENTS.md / README.md found in ${slug}`);
}

// ---------- per-tool endpoint ----------
async function toolEndpoint(slug, info, request) {
  // human in a browser -> the repo (agents content-negotiate via POST / the json accept)
  if (request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html')) {
    return Response.redirect(info.repo, 302);
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method === 'GET') return json({ name: slug, hint: `MCP endpoint for ${slug} , POST JSON-RPC (initialize, tools/list, tools/call).`, repo: info.repo });
  if (request.method !== 'POST') return new Response('method not allowed', { status: 405, headers: CORS });

  let body;
  try { body = await request.json(); } catch { return json(err(null, -32700, 'parse error'), 400); }
  const batch = Array.isArray(body);
  const msgs = batch ? body : [body];
  const out = [];
  for (const m of msgs) {
    if (!m || m.method === undefined) continue;
    if (m.id === undefined || m.id === null) continue; // notification , no response
    out.push(await handle(m, slug, info));
  }
  if (!out.length) return new Response(null, { status: 202, headers: CORS });
  return json(batch ? out : out[0]);
}

async function handle(m, slug, info) {
  const { id, method, params } = m;
  if (method === 'initialize') {
    return ok(id, {
      protocolVersion: params?.protocolVersion || PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: slug, version: VERSION },
      instructions: `${slug}: ${info.description}\n\nCall get_skill to get the full playbook, then install + use it. Repo: ${info.repo}`,
    });
  }
  if (method === 'ping') return ok(id, {});
  if (method === 'tools/list') {
    return ok(id, {
      tools: [{
        name: 'get_skill',
        description: `Get the full SKILL.md playbook for ${slug} so you can install + use it.`,
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      }],
    });
  }
  if (method === 'tools/call') {
    if (params?.name !== 'get_skill') return ok(id, { content: [{ type: 'text', text: `unknown tool '${params?.name}'` }], isError: true });
    try { return ok(id, { content: [{ type: 'text', text: await getSkill(slug, info) }] }); }
    catch (e) { return ok(id, { content: [{ type: 'text', text: String((e && e.message) || e) }], isError: true }); }
  }
  return err(id, -32601, `method not found: ${method}`);
}

const ok = (id, result) => ({ jsonrpc: '2.0', id, result });
const err = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...CORS } });
}
