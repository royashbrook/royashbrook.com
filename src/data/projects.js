// single source for projects, used by the home teaser + /projects + /llms.txt.
// links rendered in order: site, repo, skill, mcp (only the ones present show).
export const projects = [
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
    name: 'sql-spider',
    desc: 'builds a deterministic, closed dependency graph of a sql database (tables, views, procs, functions, triggers) by emitting read-only queries. point an agent at it or run it yourself.',
    repo: 'https://github.com/royashbrook/sql-spider',
    skill: 'https://github.com/royashbrook/sql-spider/blob/main/SKILL.md',
  },
  {
    name: 'neveraway',
    desc: "keeps you from showing 'away' in chat apps.",
    site: 'https://neveraway.github.io',
    repo: 'https://github.com/neveraway/neveraway',
  },
];

// the link types in display order, for the card meta + llms.txt.
export const projectLinkOrder = ['site', 'repo', 'skill', 'mcp'];
