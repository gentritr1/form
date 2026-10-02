// The deployable site: every asset is content-hashed, the page references only hashed files,
// and each vercel.json header rule matches the real paths it is meant for.
import assert from 'node:assert';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { buildSite } from '../stamp.mjs';

const root = new URL('../', import.meta.url);
const dir = await mkdtemp(join(tmpdir(), 'form-site-')), out = pathToFileURL(dir + '/');
try {
  const files = await buildSite(root, out), again = await buildSite(root, out);
  assert.deepEqual(files, again, 'The same sources give the same file names');
  const html = await readFile(new URL('index.html', out), 'utf8');
  const stamped = await readdir(new URL('static/', out));
  assert.equal(stamped.length, 3);
  for (const name of stamped) {
    const match = /^[a-z-]+\.([0-9a-f]{10})\.(css|js|jpg)$/.exec(name);
    assert(match, 'Every file under static/ carries a content hash: ' + name);
    const data = await readFile(new URL('static/' + name, out));
    assert.equal(createHash('sha256').update(data).digest('hex').slice(0, 10), match[1], 'The hash is of the content: ' + name);
    assert(html.includes('"static/' + name + '"'), 'The page references ' + name);
  }
  for (const stale of ['"styles.css"', '"app.js"', '"assets/']) assert(!html.includes(stale), 'No unhashed reference: ' + stale);
  // Content is unchanged apart from the three references.
  const source = await readFile(new URL('dist/index.html', root), 'utf8');
  assert.equal(html.replace(/static\/([a-z-]+)\.[0-9a-f]{10}\./g, (_, name) => (name === 'material-dreams' ? 'assets/' : '') + name + '.'), source);

  // vercel.json: path-to-regexp sources of the simple forms used here, checked against real URLs.
  const config = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'));
  assert.equal(config.outputDirectory, 'public');
  const matches = url => config.headers.filter(rule => new RegExp('^' + rule.source + '$').test(url));
  const cache = rule => rule.headers.find(h => h.key === 'Cache-Control').value;
  for (const name of stamped) {
    const rules = matches('/static/' + name);
    assert.equal(rules.length, 1, 'Exactly one rule for /static/' + name);
    assert.equal(cache(rules[0]), 'public, max-age=31536000, immutable');
  }
  for (const url of ['/', '/index.html']) {
    const rules = matches(url);
    assert.equal(rules.length, 1, 'Exactly one rule for ' + url);
    assert.equal(cache(rules[0]), 'public, max-age=0, must-revalidate', 'The page itself is always revalidated');
    assert(rules[0].headers.some(h => h.key === 'Vercel-CDN-Cache-Control'));
  }
  for (const rule of config.headers) assert(['/', '/index.html', ...stamped.map(n => '/static/' + n)].some(url => new RegExp('^' + rule.source + '$').test(url)), 'Rule matches a real path: ' + rule.source);
  console.log('Passed: ' + stamped.length + ' hashed assets, page references only hashed files, ' + config.headers.length + ' header rules each match a real path.');
} finally {
  await rm(dir, { recursive: true, force: true });
}
