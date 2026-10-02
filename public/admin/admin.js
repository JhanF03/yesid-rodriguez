/* Panel admin: formularios definidos por esquema (SECTIONS). Para añadir un campo, añade una fila aquí. */
const MODES = [['carousel', 'Carrusel'], ['collage', 'Collage'], ['static', 'Imágenes estáticas']];
const G = (key) => [[`galleries.${key}.title`, 'Título', 'text'], [`galleries.${key}.text`, 'Descripción', 'area'],
  [`galleries.${key}.mode`, 'Formato', 'select', MODES.slice(0, 2)], [`galleries.${key}.cta`, 'Texto del botón al final (ej. Cotizar mi boda)', 'text'],
  [`galleries.${key}.ctaMessage`, 'Mensaje de WhatsApp de ese botón', 'area'], [`galleries.${key}.images`, 'Imágenes o videos (una URL o ruta por línea)', 'list']];

const PAIR = (path, label, keys) => [path, `${label} — una por línea, separado con " | "`, 'pairs', keys];
const SECTIONS = [
  ['Marca y WhatsApp', [['brand.name', 'Nombre del estudio', 'text'], ['whatsapp.enabled', 'Mostrar botón flotante de WhatsApp', 'bool'],
    ['whatsapp.number', 'Número con código de país, sin + (ej. 573001234567)', 'text'], ['whatsapp.message', 'Mensaje predeterminado', 'area']]],
  ['Inicio (imágenes cambiantes)', [['hero.title', 'Título', 'text'], ['hero.subtitle', 'Subtítulo', 'text'],
    ['hero.interval', 'Segundos entre imágenes', 'number'], ['hero.images', 'Imágenes (una por línea)', 'list'],
    PAIR('hero.profiles', 'Accesos por perfil: etiqueta | sección (weddings, concerts o corporate)', ['label', 'target'])]],
  ['Datos de confianza', [PAIR('stats', 'Ej.: 10+ | años de experiencia', ['value', 'label'])]],
  ['Bodas', G('weddings')], ['Conciertos', G('concerts')], ['Corporativos', G('corporate')],
  ['Servicios', [['services.title', 'Título', 'text'], ['services.text', 'Descripción', 'area'],
    ['services.message', 'Mensaje del botón Cotizar ({servicio} se reemplaza por el nombre)', 'area']], 'services'],
  ['Quién soy', [['about.title', 'Título', 'text'], ['about.text', 'Texto', 'area'], ['about.mode', 'Formato de imágenes', 'select', MODES],
    ['about.images', 'Imágenes (una por línea)', 'list']]],
  ['Cómo trabajo', [['process.title', 'Título', 'text'], ['process.text', 'Descripción', 'area'], PAIR('process.items', 'Pasos: título | descripción', ['title', 'text'])]],
  ['Testimonios', [['testimonials.title', 'Título', 'text'], PAIR('testimonials.items', 'Testimonio | nombre del cliente', ['text', 'name'])]],
  ['Mi visión', [['vision.title', 'Título', 'text'], ['vision.text', 'Texto', 'area'], ['vision.image', 'Imagen de fondo (opcional)', 'text']]],
  ['Preguntas frecuentes', [['faq.title', 'Título', 'text'], PAIR('faq.items', 'Pregunta | respuesta', ['q', 'a'])]],
  ['Redes sociales', [['social.instagram', 'Instagram (URL completa)', 'text'], ['social.facebook', 'Facebook (URL)', 'text'],
    ['social.tiktok', 'TikTok (URL)', 'text'], ['social.youtube', 'YouTube (URL)', 'text']]],
  ['Contacto', [['contact.title', 'Título', 'text'], ['contact.text', 'Texto', 'area'], ]],
];

let state;
const root = document.getElementById('root');
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const get = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
const set = (o, p, v) => { const k = p.split('.'); const last = k.pop(); k.reduce((a, x) => (a[x] ??= {}), o)[last] = v; };
const parsePairs = (text, keys) => text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
  const parts = l.split('|').map((x) => x.trim());
  return Object.fromEntries(keys.map((k, i) => [k, i === keys.length - 1 ? parts.slice(i).join(' | ') : parts[i] || '']));
});
function field([path, label, type, opts]) {
  const v = get(state, path), a = `data-path="${path}" data-type="${type}"`;
  if (type === 'bool') return `<label class="row"><input type="checkbox" ${a} ${v ? 'checked' : ''}> ${label}</label>`;
  if (type === 'area') return `<label>${label}<textarea ${a}>${esc(v)}</textarea></label>`;
  if (type === 'list') return `<label>${label}<textarea ${a} style="min-height:160px" spellcheck="false">${esc((v || []).join('\n'))}</textarea></label>`;
  if (type === 'pairs') return `<label>${label}<textarea ${a} data-keys="${opts.join(',')}" style="min-height:180px" spellcheck="false">${esc((v || []).map((o) => opts.map((k) => o[k] ?? '').join(' | ')).join('\n'))}</textarea></label>`;
  if (type === 'select') return `<label>${label}<select ${a}>${opts.map(([k, t]) => `<option value="${k}" ${v === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`;
  return `<label>${label}<input type="${type}" ${a} value="${esc(v)}"></label>`;
}

function services() {
  return state.services.items.map((s, i) => `<div class="svc" data-i="${i}">
    <label class="row"><input type="checkbox" data-k="enabled" ${s.enabled ? 'checked' : ''}> Mostrar este servicio</label>
    <label class="row"><input type="checkbox" data-k="featured" ${s.featured ? 'checked' : ''}> Destacar como "Más pedido"</label>
    <label>Nombre<input data-k="name" value="${esc(s.name)}"></label><label>Precio<input data-k="price" value="${esc(s.price)}"></label>
    <label>Descripción<textarea data-k="description">${esc(s.description)}</textarea></label>
    <label>Qué incluye (una línea por ítem)<textarea data-k="includes" data-list="1">${esc((s.includes || []).join('\n'))}</textarea></label>
    <button class="btn ghost" data-del="${i}" type="button">Eliminar servicio</button></div>`).join('')
    + '<button class="btn ghost" id="add" type="button">Agregar servicio</button>';
}

const ghCfg = () => { try { return JSON.parse(localStorage.getItem('gh') || '{}'); } catch { return {}; } };
function github() {
  const c = ghCfg(), i = (k, l, t = 'text', ph = '') => `<label>${l}<input data-gh="${k}" type="${t}" placeholder="${ph}" value="${esc(c[k] || '')}"></label>`;
  return `<details><summary>Publicación (GitHub)</summary><div><p class="hint">Opcional. Guarda el contenido en tu repositorio y Netlify republica solo. Se guarda únicamente en este navegador.</p>
    ${i('repo', 'Repositorio', 'text', 'usuario/repositorio')}${i('branch', 'Rama', 'text', 'main')}${i('path', 'Archivo', 'text', 'data/site.json')}${i('token', 'Token fino de GitHub (permiso Contents: Read and write)', 'password')}</div></details>`;
}

function render() {
  root.innerHTML = `<div class="bar"><h1 style="font-size:1.8rem">Panel</h1><div class="row"><a class="btn ghost" href="/" target="_blank">Ver sitio</a>
    <button class="btn ghost" id="dl">Descargar site.json</button><button class="btn" id="save">Publicar cambios</button></div></div><p class="msg" id="msg" role="status"></p>` +
    SECTIONS.map(([t, fields, extra]) => `<details><summary>${t}</summary><div>${fields.map(field).join('')}${extra === 'services' ? services() : ''}</div></details>`).join('') + github();
}

function keepOpen(fn) { const open = [...document.querySelectorAll('details')].map((d) => d.open); fn(); document.querySelectorAll('details').forEach((d, i) => (d.open = open[i])); }

root.addEventListener('input', (e) => {
  const t = e.target, row = t.closest('[data-i]');
  if (row) { state.services.items[row.dataset.i][t.dataset.k] = t.type === 'checkbox' ? t.checked : t.dataset.list ? t.value.split('\n').map((x) => x.trim()).filter(Boolean) : t.value; return; }
  if (!t.dataset.path) return;
  const type = t.dataset.type;
  set(state, t.dataset.path, type === 'bool' ? t.checked : type === 'number' ? Number(t.value) : type === 'pairs' ? parsePairs(t.value, t.dataset.keys.split(','))
    : type === 'list' ? t.value.split('\n').map((x) => x.trim()).filter(Boolean) : t.value);
});

root.addEventListener('input', (e) => { const k = e.target.dataset.gh; if (k) localStorage.setItem('gh', JSON.stringify({ ...ghCfg(), [k]: e.target.value.trim() })); });

const json = () => JSON.stringify(state, null, 2) + '\n';
const b64 = (s) => { let bin = ''; for (const b of new TextEncoder().encode(s)) bin += String.fromCharCode(b); return btoa(bin); };
async function publish() {
  const c = ghCfg(), branch = c.branch || 'main';
  if (!c.repo || !c.token) throw new Error('Completa repositorio y token en "Publicación (GitHub)", o usa Descargar site.json.');
  const url = `https://api.github.com/repos/${c.repo}/contents/${c.path || 'data/site.json'}`, h = { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json' };
  const cur = await fetch(`${url}?ref=${branch}`, { headers: h });
  if (!cur.ok && cur.status !== 404) throw new Error(`GitHub respondió ${cur.status}. Revisa repositorio, rama y token.`);
  const sha = cur.ok ? (await cur.json()).sha : undefined;
  const res = await fetch(url, { method: 'PUT', headers: h, body: JSON.stringify({ message: 'Actualizar contenido desde el panel', content: b64(json()), sha, branch }) });
  if (!res.ok) throw new Error((await res.json()).message || 'No se pudo publicar.');
}

root.addEventListener('click', async (e) => {
  const t = e.target;
  if (t.id === 'add') { state.services.items.push({ id: 's' + Date.now(), name: 'Nuevo servicio', price: '', description: '', enabled: false }); keepOpen(render); }
  if (t.dataset.del) { state.services.items.splice(+t.dataset.del, 1); keepOpen(render); }
  const msg = document.getElementById('msg');
  if (t.id === 'dl') { const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([json()], { type: 'application/json' })), download: 'site.json' }); a.click(); URL.revokeObjectURL(a.href); }
  if (t.id === 'save') {
    msg.className = 'msg'; msg.textContent = 'Publicando…';
    try { await publish(); msg.textContent = 'Publicado. Netlify actualizará el sitio en ~1 minuto.'; msg.classList.add('ok'); }
    catch (err) { msg.textContent = err.message; msg.classList.add('err'); }
  }
});

(async () => {
  try { state = await (await fetch('/data/site.json', { cache: 'no-store' })).json(); render(); }
  catch { root.innerHTML = '<p class="msg err">No se pudo cargar /data/site.json.</p>'; }
})();
