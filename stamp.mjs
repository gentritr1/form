// Builds the deployable site: dist/ copied to an output folder with every asset renamed to
// include a hash of its content, so it can be cached for a year and never go stale.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Source reference in dist/index.html -> the file it points at.
const assets = [
  ['href="styles.css"', 'styles.css'],
  ['src="app.js"', 'app.js'],
  ['src="assets/material-dreams.jpg"', 'assets/material-dreams.jpg']
];

export async function buildSite(root, out) {
  const source = new URL('dist/', root);
  let html = await readFile(new URL('index.html', source), 'utf8');
  await rm(out, { recursive: true, force: true });
  await mkdir(new URL('static/', out), { recursive: true });
  const files = [];
  for (const [reference, path] of assets) {
    if (html.split(reference).length !== 2) throw new Error('Expected exactly one ' + reference + ' in dist/index.html.');
    const data = await readFile(new URL(path, source));
    const hash = createHash('sha256').update(data).digest('hex').slice(0, 10);
    const name = path.split('/').pop(), dot = name.lastIndexOf('.');
    const stamped = 'static/' + name.slice(0, dot) + '.' + hash + name.slice(dot);
    await writeFile(new URL(stamped, out), data);
    html = html.replace(reference, reference.replace(path, stamped));
    files.push(stamped);
  }
  // Anything still pointing at an unhashed local file would be served without long caching.
  const local = [...html.matchAll(/(?:href|src)="([^"#:]+)"/g)].map(m => m[1]).filter(url => !files.includes(url));
  if (local.length) throw new Error('Unhashed local references remain: ' + local.join(', '));
  await writeFile(new URL('index.html', out), html);
  return ['index.html', ...files];
}
