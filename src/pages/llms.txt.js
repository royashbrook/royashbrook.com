import { projects } from '../data/projects.js';
import { tools } from '../data/agents.js';

// /llms.txt — a machine-readable index so an agent scanning the site can find
// the projects and the agent tooling (and tell a skill from an mcp).
export function GET() {
  const out = [];
  out.push('# roy ashbrook');
  out.push('> dad, hub, coder, tech fan. automation and techy things since the 90s. site: https://royashbrook.com');
  out.push('');
  out.push('## projects');
  for (const p of projects) {
    const links = [p.site && `site: ${p.site}`, p.repo && `repo: ${p.repo}`].filter(Boolean).join(' | ');
    out.push(`- ${p.name}: ${p.desc} (${links})`);
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
