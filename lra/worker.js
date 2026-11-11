// lra.sh, my short links. lra.sh/<game> goes to that game, everything else goes to royashbrook.com.
// the games come from src/data/games.js, so a game listed on /games gets its short link on the next
// deploy. the slug is the game's subdomain: zap.royashbrook.com is lra.sh/zap.

import { games } from '../src/data/games.js';

const HOME = 'https://royashbrook.com/';

export const links = Object.fromEntries(games.map((g) => [new URL(g.play).hostname.split('.')[0], g.play]));

export default {
  fetch(request) {
    const slug = new URL(request.url).pathname.slice(1).replace(/\/$/, '').toLowerCase();
    const to = links[slug];
    return Response.redirect(to ?? HOME, to ? 301 : 302);
  },
};
