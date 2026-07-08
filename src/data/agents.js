// the "for ai agents" shelf, used by /agents + /llms.txt.
// the `royashbrook-tool` repos auto-populate here (single source = the github topic): each is a skill
// that ALSO exposes a discovery MCP at royashbrook.com/<name>. tools not in Roy's topic (a different
// org, etc.) are hand-listed below.
// type: 'skill' = drop-in agent skill (clone) | 'mcp' = remote mcp server (an endpoint).
import { tools as registry } from './tools.js';

const auto = registry.map((t) => ({
  name: t.name,
  type: 'skill',
  desc: t.desc,
  use: 'clone into .claude/skills/, or connect the mcp endpoint',
  links: [
    { label: 'mcp', url: t.mcp },
    { label: 'repo', url: t.repo },
  ],
}));

// not in Roy's topic (different org) , curated by hand.
const extra = [
  {
    name: 'mtok.market',
    type: 'mcp',
    desc: 'a spot market for ai inference tokens. an agent reads the manual, finds a price, pays the seller small chunks in usdc on base, and draws inference. llms.txt is the front door.',
    use: 'connect an agent to the endpoint, or point it at https://mtok.market/llms.txt',
    links: [
      { label: 'endpoint', url: 'https://mtok.market/mcp' },
      { label: 'llms.txt', url: 'https://mtok.market/llms.txt' },
    ],
  },
  {
    name: 'blame-mcp',
    type: 'mcp',
    desc: 'a remote mcp server that teaches any ai agent the recipe to blame things on blame.today. thin on purpose, it hands back a recipe, not actions, so it can not be abused.',
    use: 'connect an agent to the endpoint',
    links: [
      { label: 'endpoint', url: 'https://blame-mcp.royashbrook.workers.dev/mcp' },
      { label: 'repo', url: 'https://github.com/blame-today/blame-mcp' },
    ],
  },
];

export const tools = [...auto, ...extra];
