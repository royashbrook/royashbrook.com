// prebuild: pull the craftrush game and BUILD it into public/craftrush/, so `astro build` ships the
// built output at royashbrook.com/craftrush. craftrush is a built project (tools/build.mjs generates
// dist/ with a version stamped from git tags + an auto-generated, content-hashed service worker), so
// we clone it (FULL, its version derivation needs tags + history), run its build, and copy dist/,
// NOT the raw repo root. the craftrush repo stays the source of truth; this is refetched every build
// (and by the daily cron deploy), so a push to craftrush main shows up on the next site build.
//
// fails SOFT: a transient clone/build failure warns + continues (the site still deploys) rather than
// break the whole site over a fun kids' game.
import { execSync } from 'node:child_process';
import { rmSync, mkdirSync, cpSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = 'https://github.com/royashbrook/craftrush.git';
const BRANCH = 'main';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'public', 'craftrush');
const tmp = join(root, '.craftrush-tmp');

rmSync(tmp, { recursive: true, force: true });
try {
  // FULL clone (no --depth): the build derives the version from git tags + commit count.
  execSync(`git clone --branch ${BRANCH} ${REPO} "${tmp}"`, { stdio: 'inherit' });
  execSync('node tools/build.mjs', { cwd: tmp, stdio: 'inherit' });
} catch (e) {
  console.warn(`WARN: craftrush pull/build failed (${e.message}); shipping this build without /craftrush.`);
  rmSync(tmp, { recursive: true, force: true });
  process.exit(0);
}
const built = join(tmp, 'dist');
if (!existsSync(built)) {
  console.warn('WARN: craftrush build produced no dist/; shipping this build without /craftrush.');
  rmSync(tmp, { recursive: true, force: true });
  process.exit(0);
}
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
for (const name of readdirSync(built)) {
  cpSync(join(built, name), join(dest, name), { recursive: true });
}
rmSync(tmp, { recursive: true, force: true });
console.log('built + pulled craftrush dist -> public/craftrush/');
