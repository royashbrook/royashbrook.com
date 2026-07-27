// prebuild: pull the craftrush game and BUILD it into public/craftrush/, so `astro build` ships the
// built output at royashbrook.com/craftrush. craftrush is a built project whose build stamps a
// version from git tags and generates a service worker, so we clone it (FULL, no --depth: the
// version derivation needs tags + history), install, run ITS build script, and copy the output,
// NOT the raw repo root. the craftrush repo stays the source of truth; this is refetched every build
// (and by the daily cron deploy), so a push to craftrush main shows up on the next site build.
//
// deliberately runs `npm ci` + `npm run build` rather than naming craftrush's build tool here: that
// game moved from a hand-rolled builder writing dist/ to sveltekit writing build/, and this script
// silently shipped the site WITHOUT the game for the gap in between, because the failure path below
// is soft. asking the repo what its build is, and taking whichever output directory it produces,
// means a toolchain change over there cannot quietly delete the game from here again.
//
// fails SOFT: a transient clone/build failure warns + continues (the site still deploys) rather than
// break the whole site over a fun kids' game.
import { execSync } from 'node:child_process';
import { rmSync, mkdirSync, cpSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Give up on the game, but say so loudly.
 *
 * Failing soft is right: a broken game must not take the whole site down. But a
 * one-line warning in a thousand-line build log is how /craftrush could vanish
 * and nobody notice for a week. So this is deliberately impossible to skim past,
 * and it names what to do about it.
 */
function missing(why) {
  const line = '='.repeat(72);
  console.warn(`\n${line}`);
  console.warn('  /craftrush WILL BE MISSING FROM THIS DEPLOY');
  console.warn(`  reason: ${why}`);
  console.warn('  the site still ships, on purpose: a broken game should not break the site.');
  console.warn('  fix: check that craftrush main builds with `npm ci && npm run build`.');
  console.warn(`${line}\n`);
  rmSync(tmp, { recursive: true, force: true });
  process.exit(0);
}

const REPO = 'https://github.com/royashbrook/craftrush.git';
const BRANCH = 'main';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'public', 'craftrush');
const tmp = join(root, '.craftrush-tmp');

rmSync(tmp, { recursive: true, force: true });
try {
  // FULL clone (no --depth): the build derives the version from git tags + commit count.
  execSync(`git clone --branch ${BRANCH} ${REPO} "${tmp}"`, { stdio: 'inherit' });
  // the game's build needs its devDependencies (vite, sveltekit). skip playwright's
  // browser download: this build runs the game's build, never its tests.
  execSync('npm ci', {
    cwd: tmp,
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' },
  });
  execSync('npm run build', { cwd: tmp, stdio: 'inherit' });
} catch (e) {
  missing(`the clone or build failed: ${e.message}`);
}
// whichever directory its build writes: sveltekit uses build/, the older hand-rolled builder
// used dist/. checked in that order so a repo containing both stale dirs still picks the current one.
const built = ['build', 'dist'].map((d) => join(tmp, d)).find((d) => existsSync(d));
if (!built) missing('the build produced no build/ or dist/');
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
for (const name of readdirSync(built)) {
  cpSync(join(built, name), join(dest, name), { recursive: true });
}
rmSync(tmp, { recursive: true, force: true });
console.log(`built + pulled craftrush ${built.split('/').pop()}/ -> public/craftrush/`);
