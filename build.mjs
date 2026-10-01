import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const [html, css, js, image] = await Promise.all([
  read('dist/index.html'), read('dist/styles.css'), read('dist/app.js'),
  readFile(new URL('dist/assets/material-dreams.jpg', root))
]);
const resources = '<link rel="stylesheet" href="styles.css"><script src="app.js" defer></script>';
if (!html.includes(resources)) throw new Error('The standalone resource marker is missing.');
const standalone = html.replace(resources, '<style>' + css + '</style>')
  .replace('src="assets/material-dreams.jpg"', 'src="data:image/jpeg;base64,' + image.toString('base64') + '"')
  .replace('</body>', '<script>' + js + '</script></body>');
await writeFile(new URL('FORM.html', root), standalone);
console.log('Built FORM.html (' + Buffer.byteLength(standalone) + ' bytes).');
