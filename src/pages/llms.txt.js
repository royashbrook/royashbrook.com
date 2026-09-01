import { projects, projectLinkOrder } from '../data/projects.js';
import { games, gameLinkOrder } from '../data/games.js';
import { tools } from '../data/agents.js';
import { tools as skills } from '../data/tools.js';

// /llms.txt — a machine-readable index so an agent scanning the site can find
// the projects and the agent tooling (and tell a skill from an mcp).
export function GET() {
  const out = [];
  out.push('# roy ashbrook');
  out.push('> dad, hub, coder, tech fan. automation and techy things since the 90s. site: https://royashbrook.com');
  out.push('');
  out.push('## projects');
  for (const p of projects) {
    const links = projectLinkOrder.filter((k) => p[k]).map((k) => `${k}: ${p[k]}`).join(' | ');
    out.push(`- ${p.name}: ${p.desc} (${links})`);
  }
  out.push('');
  out.push('## games');
  out.push('# small browser games, free forever: no ads, no lives, no timers, nothing to buy, no accounts, no tracking. each installs to a phone and plays offline.');
  for (const g of games) {
    const links = gameLinkOrder.filter((k) => g[k]).map((k) => `${k}: ${g[k]}`).join(' | ');
    out.push(`- ${g.name}: ${g.desc} (${links})`);
  }
  out.push('');
  out.push('## skills');
  out.push('# drop-in agent skills, auto-listed from the royashbrook-tool github topic. each has a SKILL.md to clone and an mcp endpoint.');
  for (const s of skills) {
    const links = ['repo', 'skill', 'mcp'].filter((k) => s[k]).map((k) => `${k}: ${s[k]}`).join(' | ');
    out.push(`- ${s.name}: ${s.desc} (${links})`);
  }
  out.push('');
  out.push('## for ai agents');
  out.push('# type tells you what each is: skill = drop-in agent skill (clone), mcp = remote mcp server (endpoint).');
  for (const t of tools) {
    const links = t.links.map((l) => `${l.label}: ${l.url}`).join(' | ');
    out.push(`- ${t.name} [${t.type}]: ${t.desc} (use: ${t.use} | ${links})`);
  }
  out.push('');
  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
