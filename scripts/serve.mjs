/* Servidor estático mínimo solo para previsualizar dist/ en local (sin dependencias). */
import http from 'node:http'; import fs from 'node:fs/promises'; import path from 'node:path';
const dist = path.resolve('dist'), port = process.env.PORT || 3000;
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.xml': 'application/xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4' };
http.createServer(async (req, res) => {
  let p = path.join(dist, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(dist)) { res.writeHead(403); return res.end(); }
  try { if ((await fs.stat(p)).isDirectory()) p = path.join(p, 'index.html'); res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'application/octet-stream' }); res.end(await fs.readFile(p)); }
  catch { res.writeHead(404); res.end('No encontrado'); }
}).listen(port, () => console.log(`Sitio: http://localhost:${port}  |  Admin: http://localhost:${port}/admin/`));
