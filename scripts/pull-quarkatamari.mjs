// prebuild: pull the quarkatamari game and BUILD it into public/quarkatamari/, so `astro build` ships
// it at royashbrook.com/quarkatamari. The game repo stays the source of truth and is refetched every
// build. V1 needs its old root-path rewrite; V2's SvelteKit artifact is already subpath-safe and must
// be copied byte-for-byte because its filenames are content hashes.
//
// QUARKATAMARI_REF lets the game-owned deploy workflow pin the exact verified main commit. Scheduled
// site builds default to current main and run the repository's own verification before copying it.
//
// version: major.minor from the latest git tag, patch = commits since it (same rule as craftrush),
// stamped into the shipped index.html as a meta tag so the deployed build is identifiable.
//
import { execSync, execFileSync } from 'node:child_process';
import { rmSync, mkdirSync, cpSync, readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = 'https://github.com/royashbrook/quarkatamari.git';
const REF = process.env.QUARKATAMARI_REF || 'main';
const SUBPATH = '/quarkatamari';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'public', 'quarkatamari');
const tmp = join(root, '.quarkatamari-tmp');

rmSync(tmp, { recursive: true, force: true });
// FULL clone (no --depth): the version derives from git tags + commit count.
execFileSync('git', ['clone', REPO, tmp], { stdio: 'inherit' });
execFileSync('git', ['fetch', 'origin', REF], { cwd: tmp, stdio: 'inherit' });
execFileSync('git', ['checkout', '--detach', 'FETCH_HEAD'], { cwd: tmp, stdio: 'inherit' });
execSync('npm ci --no-audit --no-fund', { cwd: tmp, stdio: 'inherit' });

const gamePackage = JSON.parse(readFileSync(join(tmp, 'package.json'), 'utf8'));
if (gamePackage.scripts?.['test:all']) {
  if (process.env.CI) {
    execSync('npx playwright install --with-deps chromium', { cwd: tmp, stdio: 'inherit' });
    execSync('npm run test:all', { cwd: tmp, stdio: 'inherit' });
  } else {
    for (const command of ['npm run check', 'npm test', 'npm run build', 'npm run test:artifact']) {
      execSync(command, { cwd: tmp, stdio: 'inherit' });
    }
  }
} else {
  // Keep the companion change safe while the current v1 artifact is still on main.
  execSync('npm test', { cwd: tmp, stdio: 'inherit' });
}

const built = join(tmp, 'dist', 'client');
if (!existsSync(join(built, 'index.html'))) {
  throw new Error('quarkatamari build produced no dist/client/index.html');
}
const v2Artifact = readFileSync(join(built, 'index.html'), 'utf8')
  .includes('data-release="v2-sveltekit"');

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
if (!v2Artifact) walk(dest);

// stamp the version and immutable source identity into the shipped shell
const idx = join(dest, 'index.html');
const commit = git(['rev-parse', 'HEAD']);
writeFileSync(idx, readFileSync(idx, 'utf8').replace(
  /<head>/i,
  `<head><meta name="app-version" content="${version}"><meta name="app-commit" content="${commit}">`,
));

rmSync(tmp, { recursive: true, force: true });
console.log(`built + pulled quarkatamari ${version} (${commit}) -> public/quarkatamari/`);
