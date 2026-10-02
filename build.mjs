/* Genera la carpeta dist/ (sitio 100% estático): pre-renderiza el HTML con data/site.json, igual que hacía el servidor. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as view from './public/js/render.mjs';

const root = path.dirname(fileURLToPath(import.meta.url)), dist = path.join(root, 'dist');
const base = (process.env.SITE_URL || process.env.URL || '').replace(/\/$/, ''); // Netlify define URL automáticamente
const { smtp, ...d } = JSON.parse(await fs.readFile(path.join(root, 'data/site.json'), 'utf8')); // smtp NUNCA se publica

await fs.rm(dist, { recursive: true, force: true });
await fs.cp(path.join(root, 'public'), dist, { recursive: true });
await fs.mkdir(path.join(dist, 'data'));
await fs.writeFile(path.join(dist, 'data/site.json'), JSON.stringify(d, null, 2)); // lo lee el panel /admin/

const cfg = JSON.stringify({ whatsapp: d.whatsapp, hero: { interval: d.hero?.interval } }).replace(/</g, '\\u003c');
const html = (await fs.readFile(path.join(root, 'public/index.html'), 'utf8'))
  .replace('<!--HEAD-->', () => view.headHtml(d, base)).replace('<!--BRAND-->', () => view.esc(d.brand.name))
  .replace('<!--NAV-->', () => view.navHtml(d)).replace('<!--APP-->', () => view.pageHtml(d))
  .replace('<script src="/js/app.js"', () => `<script id="cfg" type="application/json">${cfg}</script>\n  <script src="/js/app.js"`);
await fs.writeFile(path.join(dist, 'index.html'), html);

await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nDisallow: /admin/\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ''}`);
if (base) await fs.writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}/</loc></url></urlset>`);
console.log(`dist/ listo${base ? ` (${base})` : ' (sin SITE_URL: sitemap omitido)'}`);
