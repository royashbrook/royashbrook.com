// lra.sh, my short links. lra.sh/<game> goes to that game. the root is the list of every link and
// where it goes, so nobody needs the cloudflare dashboard to see them; an unknown path gets the same
// list with a 404. the games come from src/data/games.js, so a game listed on /games gets its short
// link on the next deploy. the slug is the game's subdomain: zap.royashbrook.com is lra.sh/zap.

import { games } from '../src/data/games.js';

export const links = Object.fromEntries(games.map((g) => [new URL(g.play).hostname.split('.')[0], g.play]));

const bare = (u) => u.replace(/^https:\/\//, '').replace(/\/$/, '');

export const page = () => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>lra.sh</title>
<meta name="description" content="short links, and where each one goes.">
<style>
:root { --bg: #fbfbf9; --fg: #1b1b18; --faint: #8d8c84; --line: rgba(0,0,0,.07); --accent: #185fa5;
  --mono: ui-monospace, "SF Mono", SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
@media (prefers-color-scheme: dark) { :root { --bg: #100f0e; --fg: #e9e8e2; --faint: #6c6b63;
  --line: rgba(255,255,255,.07); --accent: #7fb1e6; } }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.75 var(--mono); }
main { max-width: 640px; margin: 0 auto; padding: 2.5rem 1rem 4rem; }
h1 { font-size: 1rem; font-weight: 600; margin: 0 0 1.5rem; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
ul { list-style: none; margin: 0; padding: 0; }
li { display: flex; flex-wrap: wrap; gap: 0 .75rem; padding: .4rem 0; border-bottom: 1px solid var(--line); }
li span { color: var(--faint); }
footer { margin-top: 2rem; color: var(--faint); }
</style>
</head>
<body>
<main>
<h1>lra.sh</h1>
<ul>
${Object.entries(links).map(([s, to]) => `<li><a href="/${s}">lra.sh/${s}</a><span>&rarr;</span><a href="${to}">${bare(to)}</a></li>`).join('\n')}
</ul>
<footer><a href="https://royashbrook.com/">royashbrook.com</a></footer>
</main>
</body>
</html>
`;

export default {
  fetch(request) {
    const slug = new URL(request.url).pathname.slice(1).replace(/\/$/, '').toLowerCase();
    if (links[slug]) return Response.redirect(links[slug], 301);
    return new Response(page(), { status: slug ? 404 : 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  },
};
