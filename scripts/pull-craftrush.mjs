// prebuild: pull the craftrush game (public repo, pure static, no build step) into public/craftrush/
// so `astro build` ships it at royashbrook.com/craftrush. the craftrush repo stays the source of
// truth; this copy is gitignored + refetched every build (and by the daily cron deploy), so a game
// update on craftrush main shows up on the next site build. the game's paths are all relative and its
// service worker registers relative, so it just works under the /craftrush/ subpath, no code changes.
//
// fails SOFT: a transient clone failure warns + continues (the site still deploys) rather than break
// the whole site over a fun kids' game being briefly unreachable.
import { execSync } from 'node:child_process';
import { rmSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = 'https://github.com/royashbrook/craftrush.git';
const BRANCH = 'main';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'public', 'craftrush');
const tmp = join(root, '.craftrush-tmp');

// keep dev/agent machinery out of the public copy; serve only the app + its docs/license.
const EXCLUDE = new Set(['.git', '.claude', '.githooks', '.gitignore']);

rmSync(tmp, { recursive: true, force: true });
try {
  execSync(`git clone --depth 1 --branch ${BRANCH} ${REPO} "${tmp}"`, { stdio: 'inherit' });
} catch (e) {
  console.warn(`WARN: craftrush pull failed (${e.message}); shipping this build without /craftrush.`);
  rmSync(tmp, { recursive: true, force: true });
  process.exit(0);
}
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
for (const name of readdirSync(tmp)) {
  if (EXCLUDE.has(name)) continue;
  cpSync(join(tmp, name), join(dest, name), { recursive: true });
}
rmSync(tmp, { recursive: true, force: true });
console.log('pulled craftrush -> public/craftrush/');
