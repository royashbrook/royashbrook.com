// single source for the "for ai agents" shelf, used by /agents + /llms.txt.
// each tool is tagged by `type` so a reader (human or agent) can tell skill from mcp.
// type: 'skill' = drop-in agent skill (clone, nothing hosted)
//       'mcp'   = remote mcp server (an endpoint an agent connects to)
export const tools = [
  {
    name: 'sql-spider',
    type: 'skill',
    desc: 'a drop-in agent skill that builds a deterministic, closed dependency graph of a sql database by emitting read-only queries. the agent is the adapter, so no live db connection is needed. (no mcp, it is just a skill that rides on top of another skill.)',
    use: 'clone into .claude/skills/',
    links: [{ label: 'repo', url: 'https://github.com/royashbrook/sql-spider' }],
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
