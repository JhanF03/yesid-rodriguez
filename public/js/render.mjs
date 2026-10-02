/* Plantillas puras (sin DOM): las usa el servidor para pre-renderizar (SEO) y el navegador como respaldo. */
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isVideo = (u) => /\.(mp4|webm|mov)(\?|$)/i.test(u);
const safe = (u) => (/^https?:\/\//i.test(u) ? u : '#');
const list = (a) => (Array.isArray(a) ? a : []);
export const waLink = (num, text) => `https://wa.me/${String(num).replace(/\D/g, '')}?text=${encodeURIComponent(text || '')}`;
const media = (u, alt = '', cls = '') => isVideo(u)
  ? `<video class="${cls}" src="${esc(u)}" muted loop playsinline autoplay preload="metadata"></video>`
  : `<img class="${cls}" src="${esc(u)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;

const SOCIAL = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
const socials = (d) => Object.entries(SOCIAL).filter(([k]) => d.social?.[k])
  .map(([k, n]) => `<a href="${esc(safe(d.social[k]))}" target="_blank" rel="noopener">${n}</a>`).join('');

const figures = (imgs, alt) => list(imgs).map((u) => `<figure>${media(u, alt)}</figure>`).join('');
function gallery(mode, imgs, alt) {
  if (mode === 'collage') return `<div class="collage gallery">${figures(imgs, alt)}</div>`;
  if (mode === 'static') return `<div class="static gallery">${figures(list(imgs).slice(0, 3), alt)}</div>`;
  return `<div class="carousel"><div class="track gallery" tabindex="0">${figures(imgs, alt)}</div>
    <button class="arrow prev" aria-label="Anterior">‹</button><button class="arrow next" aria-label="Siguiente">›</button></div>`;
}
const head = (s) => `<div class="section-head"><h2>${esc(s.title)}</h2>${s.text ? `<p>${esc(s.text)}</p>` : ''}</div>`;
const ctaBtn = (d, label, msg) => (label && d.whatsapp?.number
  ? `<p class="cta-row"><a class="btn" target="_blank" rel="noopener" href="${waLink(d.whatsapp.number, msg || d.whatsapp.message)}">${esc(label)}</a></p>` : '');

const sections = {
  hero: (d) => `<section class="hero" id="inicio">
    <div class="hero-slides">${list(d.hero.images).map((u, i) => media(u, d.hero.title, i ? '' : 'on')).join('')}</div>
    <div class="hero-in"><h1>${esc(d.hero.title)}</h1><p>${esc(d.hero.subtitle)}</p>
    <div class="hero-cta">${d.whatsapp?.number ? `<a class="btn" target="_blank" rel="noopener" href="${waLink(d.whatsapp.number, d.whatsapp.message)}">Cotizar por WhatsApp</a>` : ''}
    <a class="btn light" href="#weddings">Ver trabajos</a></div>
    ${list(d.hero.profiles).length ? `<div class="profiles"><span>Busco fotógrafo para</span>${list(d.hero.profiles).map((p) => `<a href="#${esc(p.target)}">${esc(p.label)}</a>`).join('')}</div>` : ''}
    </div></section>`,

  stats: (d) => (list(d.stats).length ? `<div class="stats"><div class="stats-in">${list(d.stats).map((s) => `<div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}</div></div>` : ''),

  about: (d) => `<div class="band" id="sobre-mi"><section class="section about"><div><h2>${esc(d.about.title)}</h2><div class="text">${esc(d.about.text)}</div></div>
    <div>${gallery(d.about.mode, d.about.images, d.about.title)}</div></section></div>`,

  gallery: (key) => (d) => { const g = d.galleries[key];
    return `<section class="section" id="${key}">${head(g)}${gallery(g.mode, g.images, g.title)}${ctaBtn(d, g.cta, g.ctaMessage)}</section>`; },

  services: (d) => {
    const items = list(d.services.items).filter((s) => s.enabled);
    if (!items.length) return '';
    return `<div class="band" id="servicios"><section class="section">${head(d.services)}<div class="cards">${items.map((s) => `
      <article class="card${s.featured ? ' featured' : ''}">${s.featured ? '<span class="badge">Más pedido</span>' : ''}<h3>${esc(s.name)}</h3><span class="price">${esc(s.price)}</span><p>${esc(s.description)}</p>
      ${list(s.includes).length ? `<ul class="inc">${list(s.includes).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
      <a class="btn" target="_blank" rel="noopener" href="${waLink(d.whatsapp?.number, (d.services.message || '').replace('{servicio}', s.name))}">Cotizar</a></article>`).join('')}</div></section></div>`;
  },

  process: (d) => (list(d.process?.items).length ? `<section class="section" id="proceso">${head(d.process)}<ol class="steps">${list(d.process.items)
    .map((s, i) => `<li><b>${i + 1}</b><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol></section>` : ''),

  testimonials: (d) => (list(d.testimonials?.items).length ? `<div class="band" id="testimonios"><section class="section">${head(d.testimonials)}<div class="quotes">${list(d.testimonials.items)
    .map((t) => `<figure><blockquote>${esc(t.text)}</blockquote><figcaption>${esc(t.name)}</figcaption></figure>`).join('')}</div></section></div>` : ''),

  vision: (d) => `<div class="vision${d.vision.image ? ' has-img' : ''}" id="vision">${d.vision.image ? media(d.vision.image, '', 'bg') : ''}
    <section class="section"><h2>${esc(d.vision.title)}</h2><blockquote>${esc(d.vision.text)}</blockquote></section></div>`,

  faq: (d) => (list(d.faq?.items).length ? `<section class="section faq" id="preguntas">${head(d.faq)}${list(d.faq.items)
    .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>` : ''),

  contact: (d) => `<div class="band" id="contacto"><section class="section contact"><div>${head(d.contact)}
    ${d.whatsapp?.number ? `<a class="btn wa-btn" target="_blank" rel="noopener" href="${waLink(d.whatsapp.number, d.whatsapp.message)}">Escribir por WhatsApp</a><p class="hint">Es la forma más rápida de cotizar.</p>` : ''}
    <div class="soc">${socials(d)}</div></div>
    <form id="form" name="contact" method="POST" data-netlify="true" netlify-honeypot="website" novalidate><input type="hidden" name="form-name" value="contact"><h3>O déjame tus datos</h3>
      <label>Nombre<input name="name" autocomplete="name" required></label>
      <label>Correo<input name="email" type="email" autocomplete="email" inputmode="email" required></label>
      <div class="two"><label>Tipo de evento<select name="eventType"><option>Boda</option><option>Concierto o evento musical</option><option>Evento corporativo</option><option>Otro</option></select></label>
      <label>Fecha (si ya la tienes)<input name="date" type="date"></label></div>
      <label>Cuéntame más<textarea name="message" required></textarea></label>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn" type="submit">Enviar mensaje</button><p class="msg" role="status"></p>
    </form></section></div>`,
};

export const pageHtml = (d) => [sections.hero, sections.stats, sections.about, sections.gallery('weddings'), sections.gallery('concerts'), sections.gallery('corporate'),
  sections.services, sections.process, sections.testimonials, sections.vision, sections.faq, sections.contact].map((f) => f(d)).join('')
  + `<footer><div class="soc">${socials(d)}</div>© ${new Date().getFullYear()} ${esc(d.brand.name)}</footer>`;

export const navHtml = (d) => [['sobre-mi', 'Sobre mí'], ['weddings', d.galleries.weddings.title], ['concerts', d.galleries.concerts.title],
  ['corporate', d.galleries.corporate.title], ['servicios', 'Servicios'], ['contacto', 'Contacto']]
  .map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join('')
  + (d.social?.instagram ? `<a href="${esc(safe(d.social.instagram))}" target="_blank" rel="noopener">Instagram</a>` : '');

/* SEO: título, descripción, Open Graph y datos estructurados (schema.org) */
export function headHtml(d, base = '') {
  const title = `${d.brand.name} · Fotografía de bodas, conciertos y eventos`;
  const desc = d.hero.subtitle || '';
  const img = list(d.hero.images)[0] || '';
  const abs = (u) => (/^https?:/i.test(u) ? u : base + u);
  const ld = { '@context': 'https://schema.org', '@type': 'Photographer', name: d.brand.name, description: desc, image: img ? abs(img) : undefined,
    url: base || undefined, sameAs: Object.values(d.social || {}).filter(Boolean) };
  return `<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
  <meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
  ${img ? `<meta property="og:image" content="${esc(abs(img))}">` : ''}<meta name="twitter:card" content="summary_large_image">
  ${base ? `<link rel="canonical" href="${esc(base)}/">` : ''}<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}
