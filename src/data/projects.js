// projects, used by the home teaser + /projects + /llms.txt.
// the `royashbrook-tool` repos auto-populate (single source = the github topic), each with its repo,
// skill, and royashbrook.com/<name> mcp endpoint. sites/apps + other-org projects are hand-listed.
// links rendered in order: site, repo, skill, mcp (only the ones present show).
import { tools as registry } from './tools.js';

const toolProjects = registry.map((t) => ({
  name: t.name,
  desc: t.desc,
  repo: t.repo,
  skill: t.skill,
  mcp: t.mcp,
}));

// not in Roy's tool topic (sites/apps, other orgs) , hand-curated.
const other = [
  {
    name: 'blame.today',
    desc: 'anonymous public blame board. pick who or what you blame today and watch the tally. no account, every vote is a throwaway key on nostr.',
    site: 'https://blame.today',
    repo: 'https://github.com/blame-today/blame-web',
    skill: 'https://blame.today/agents/blame-bot.skill.md',
    mcp: 'https://blame-mcp.royashbrook.workers.dev/mcp',
  },
  {
    name: 'lifescored.com',
    desc: 'the hidden scores institutions already put on you, rebuilt in the open. every rule shown with its citation, every weight visible and editable.',
    site: 'https://lifescored.com',
    repo: 'https://github.com/royashbrook/lifescored',
    skill: 'https://github.com/royashbrook/lifescored/blob/main/skills/lifescored/SKILL.md',
    mcp: 'https://lifescored.com/mcp',
  },
  {
    name: 'neveraway',
    desc: "keeps you from showing 'away' in chat apps.",
    site: 'https://neveraway.github.io',
    repo: 'https://github.com/neveraway/neveraway',
  },
];

export const projects = [...toolProjects, ...other];

// the link types in display order, for the card meta + llms.txt.
export const projectLinkOrder = ['site', 'repo', 'skill', 'mcp'];
