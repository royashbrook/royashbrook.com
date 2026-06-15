// one-shot porter: jekyll posts -> astro content collection, urls preserved.
// reads the old site, writes src/content/posts/*.md. idempotent (clears target first).
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// derive paths from this script's own location so a repo rename never breaks it.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = '/Users/roy/gh/royashbrook.github.io';
const OUT = join(ROOT, 'src/content/posts');
const POST_DIRS = ['2000s/_posts', '2010s/_posts', '2020s/_posts', '_posts'];

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });

const stripQuotes = (s) => s.replace(/^["']|["']$/g, '').trim();

function parse(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (mm) fm[mm[1].toLowerCase()] = stripQuotes(mm[2]);
  }
  return { fm, body: m[2] };
}

function transform(body) {
  let b = body;
  // {% gist ID file %} or {% gist ID %} -> github gist embed (owner: royashbrook)
  b = b.replace(/\{%\s*gist\s+([A-Za-z0-9]+)(?:\s+([^\s%]+))?\s*%\}/g, (_, id, file) =>
    file
      ? `<script src="https://gist.github.com/royashbrook/${id}.js?file=${file}"></script>`
      : `<script src="https://gist.github.com/royashbrook/${id}.js"></script>`
  );
  // jekyll baseurl -> root-relative
  b = b.replace(/\{\{\s*site\.baseurl\s*\}\}/g, '');
  return b;
}

let written = 0, skipped = 0, noTitle = 0, leftover = 0;
const dates = [];

for (const dir of POST_DIRS) {
  const full = join(SRC, dir);
  if (!existsSync(full)) continue;
  for (const file of readdirSync(full)) {
    if (!file.endsWith('.md') || file === '_template.md') continue;
    const dm = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
    if (!dm) { skipped++; continue; }
    const [, y, mo, d, slug] = dm;
    const { fm, body } = parse(readFileSync(join(full, file), 'utf8'));
    if (fm.published === 'false') { skipped++; continue; }

    let title = fm.title;
    if (!title) { title = slug.replace(/-/g, ' '); noTitle++; }

    // filename date is authoritative; only trust fm.date when it's a clean YYYY-MM-DD
    // (one post had a malformed `date: 20200615` that coerced to 1970).
    const fmDate = fm.date && /^\d{4}-\d{2}-\d{2}/.test(fm.date) ? fm.date.slice(0, 10) : null;
    const date = fmDate || `${y}-${mo}-${d}`;
    // url-safe slug: drop chars that break a path (# is a fragment delimiter). title keeps them.
    const urlSlug = slug.replace(/[#?%]/g, '');
    const path = `${y}/${mo}/${d}/${urlSlug}`;
    const out = transform(body);
    if (/\{%|\{\{/.test(out)) leftover++;

    const fmOut = `---\ntitle: ${JSON.stringify(title)}\ndate: ${date}\npath: ${JSON.stringify(path)}\n---\n\n`;
    writeFileSync(join(OUT, `${date}-${urlSlug}.md`), fmOut + out.trimStart() + '\n');
    written++;
    dates.push(date);
  }
}

// bring the images/css assets over so post media resolves at /assets/...
const assetsSrc = join(SRC, 'assets');
const assetsOut = join(ROOT, 'public/assets');
if (existsSync(assetsSrc)) { rmSync(assetsOut, { recursive: true, force: true }); cpSync(assetsSrc, assetsOut, { recursive: true }); }

dates.sort();
console.log(`ported: ${written} posts`);
console.log(`skipped (unpublished/non-post): ${skipped}`);
console.log(`title derived from slug: ${noTitle}`);
console.log(`posts with leftover liquid (need manual look): ${leftover}`);
console.log(`date range: ${dates[0]} -> ${dates[dates.length - 1]}`);
