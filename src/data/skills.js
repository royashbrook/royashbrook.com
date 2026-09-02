// the one skills registry, used by /skills, /agents, the home teaser, and /llms.txt.
// two sources: the `royashbrook-tool` github topic auto-discovers the standalone skill repos
// (tools.js), then explicit adapters for skills the topic cannot see because they live inside
// a product repo, on a product site, or in another org. add a skill here once; every surface
// derives from this list. links render in order: repo, skill, mcp (only the ones present show).
import { tools as registry } from './tools.js';

const adapters = [
  {
    name: 'lifescored',
    desc: 'compute, break down, or improve a lifescored transparency score on-device from the public rulebook. no personal data leaves the machine.',
    repo: 'https://github.com/royashbrook/lifescored',
    skill: 'https://github.com/royashbrook/lifescored/blob/main/skills/lifescored/SKILL.md',
    mcp: 'https://lifescored.com/mcp',
  },
  {
    name: 'blame-bot',
    desc: 'blame someone or something on blame.today, pile onto a target, or read the tally. anonymous throwaway-keyed nostr events, no account.',
    repo: 'https://github.com/blame-today/blame-web',
    skill: 'https://blame.today/agents/blame-bot.skill.md',
    mcp: 'https://blame.today/mcp',
  },
  {
    name: 'mtok-market',
    desc: 'buy or sell ai inference tokens on the mtok.market spot market from an agent. the public mcp mirror is the install source.',
    repo: 'https://github.com/mtok-market/mcp',
    skill: 'https://github.com/mtok-market/mcp/blob/main/SKILL.md',
    mcp: 'https://mtok.market/mcp',
  },
];

export const skills = [...registry, ...adapters].sort((a, b) => a.name.localeCompare(b.name));

export const skillLinkOrder = ['repo', 'skill', 'mcp'];
