// build-time tool registry , the `royashbrook-tool` github topic is the single source of truth for
// Roy's published agent tools. tag a public repo and it shows up on /projects, /agents, and /llms.txt,
// and gets its royashbrook.com/<name> MCP endpoint (served by the worker). every push rebuilds, and a
// daily scheduled deploy picks up new tags. fetched once at build; if github is unreachable the build
// fails loudly rather than shipping an empty shelf (the previous good deploy stays live).
const OWNER = 'royashbrook';
const TOPIC = 'royashbrook-tool';

async function fetchTools() {
  const r = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100&sort=full_name`, {
    headers: { 'User-Agent': 'royashbrook.com-build', Accept: 'application/vnd.github+json' },
  });
  if (!r.ok) throw new Error(`tool registry: github repos api ${r.status}`);
  const repos = await r.json();
  return repos
    .filter((x) => Array.isArray(x.topics) && x.topics.includes(TOPIC) && !x.archived && !x.private)
    .map((x) => ({
      name: x.name,
      desc: (x.description || '').toLowerCase(),
      repo: x.html_url,
      branch: x.default_branch,
      skill: `${x.html_url}/blob/${x.default_branch}/SKILL.md`,
      mcp: `https://royashbrook.com/${x.name}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const tools = await fetchTools();
