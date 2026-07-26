// prebuild: pull the quarkatamari game and BUILD it into public/quarkatamari/, so `astro build` ships
// it at royashbrook.com/quarkatamari. Same shape as pull-craftrush.mjs (the game repo stays the source
// of truth, refetched every build), with two differences forced by this game's stack:
//
//  1. it's a Next static export (vinext) whose artifact is dist/client/, not the repo root.
//  2. Next's `basePath` can't be used: vinext's export DROPS index.html when it's set. So we build
//     root-relative and rewrite the built absolute paths (/assets, /icon-*, /favicon, /manifest) to
//     the subpath here. The PWA bits (sw registration, sw precache, manifest) are already ./-relative
//     in the game repo, so they need no rewriting, only these root-absolute build outputs do.
//
// version: major.minor from the latest git tag, patch = commits since it (same rule as craftrush),
// stamped into the shipped index.html as a meta tag so the deployed build is identifiable.
//
// fails SOFT: a clone/build failure warns + continues (the site still deploys) rather than break the
// whole site over a game.
import { execSync, execFileSync } from 'node:child_process';
import { rmSync, mkdirSync, cpSync, readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = 'https://github.com/royashbrook/quarkatamari.git';
const BRANCH = 'main';
const SUBPATH = '/quarkatamari';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'public', 'quarkatamari');
const tmp = join(root, '.quarkatamari-tmp');

rmSync(tmp, { recursive: true, force: true });
try {
  // FULL clone (no --depth): the version derives from git tags + commit count.
  execSync(`git clone --branch ${BRANCH} ${REPO} "${tmp}"`, { stdio: 'inherit' });
  execSync('npm ci --no-audit --no-fund', { cwd: tmp, stdio: 'inherit' });
  execSync('npm run build', { cwd: tmp, stdio: 'inherit' });
} catch (e) {
  console.warn(`WARN: quarkatamari pull/build failed (${e.message}); shipping without /quarkatamari.`);
  rmSync(tmp, { recursive: true, force: true });
  process.exit(0);
}
const built = join(tmp, 'dist', 'client');
if (!existsSync(join(built, 'index.html'))) {
  console.warn('WARN: quarkatamari build produced no dist/client/index.html; shipping without it.');
  rmSync(tmp, { recursive: true, force: true });
  process.exit(0);
}

// version: <latest tag major.minor>.<commits since tag>
const git = (args) => {
  try { return execFileSync('git', args, { cwd: tmp }).toString().trim(); } catch { return ''; }
};
let version;
const tag = git(['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*']);
if (tag) {
  const mm = tag.replace(/^v/, '').split('.').slice(0, 2);
  while (mm.length < 2) mm.push('0');
  version = `${mm.join('.')}.${git(['rev-list', `${tag}..HEAD`, '--count']) || '0'}`;
} else {
  version = `0.0.${git(['rev-list', 'HEAD', '--count']) || '0'}`;
}

// the game's own _headers is inert here (only the site-root _headers is read) and .vite/.assetsignore
// are build internals, so don't ship them. Cache rules for this subpath live in the site's _headers.
const SKIP = new Set(['_headers', '.assetsignore', '.vite']);
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
for (const name of readdirSync(built)) {
  if (SKIP.has(name)) continue;
  cpSync(join(built, name), join(dest, name), { recursive: true });
}

// Rewrite root-absolute build output to the subpath. Only touches href/src/url() style references
// that start with a slash and point at this build's own top-level artifacts, so it can't rewrite an
// external URL (those start with a scheme) or an already-prefixed path.
const OWN = ['assets', 'icon-192.png', 'icon-512.png', 'favicon.svg', 'manifest.webmanifest', 'sw.js'];
const rewrite = (s) => {
  const ownPaths = OWN.reduce((acc, name) => acc.split(`"/${name}`).join(`"${SUBPATH}/${name}`)
                                            .split(`'/${name}`).join(`'${SUBPATH}/${name}`)
                                            .split(`(/${name}`).join(`(${SUBPATH}/${name}`), s);
  // Vite's generated preload helper builds lazy chunk and CSS URLs as `"/" + dependency`. It has no
  // literal `/assets` for the path rewrite above to catch, so preserve the hosting subpath here too.
  return ownPaths.replace(/return`\/`\+([A-Za-z_$][\w$]*)/g, `return\`${SUBPATH}/\`+$1`);
};
const walk = (dir) => {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) { walk(p); continue; }
    if (!/\.(html|js|css|json|webmanifest|rsc)$/i.test(name.name)) continue;
    const before = readFileSync(p, 'utf8');
    const after = rewrite(before);
    if (after !== before) writeFileSync(p, after);
  }
};
walk(dest);

// stamp the version so the deployed build is identifiable from the page itself
const idx = join(dest, 'index.html');
writeFileSync(idx, readFileSync(idx, 'utf8').replace(/<head>/i, `<head><meta name="app-version" content="${version}">`));

rmSync(tmp, { recursive: true, force: true });
console.log(`built + pulled quarkatamari ${version} -> public/quarkatamari/`);
