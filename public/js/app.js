/* Navegador: hidrata la página (pre-renderizada por el servidor) y añade interacciones. */
import { esc, waLink } from './render.mjs';
const $ = (s, r = document) => r.querySelector(s);

function initHero(seconds) {
  const slides = document.querySelectorAll('.hero-slides > *');
  if (slides.length < 2) return;
  let i = 0;
  setInterval(() => { slides[i].classList.remove('on'); i = (i + 1) % slides.length; slides[i].classList.add('on'); }, (seconds || 5) * 1000);
}

function initCarousels() {
  document.querySelectorAll('.carousel').forEach((c) => {
    const track = $('.track', c), step = () => track.clientWidth * 0.8;
    $('.prev', c).onclick = () => track.scrollBy({ left: -step(), behavior: 'smooth' });
    $('.next', c).onclick = () => track.scrollBy({ left: step(), behavior: 'smooth' });
    track.onkeydown = (e) => { if (e.key === 'ArrowRight') $('.next', c).click(); if (e.key === 'ArrowLeft') $('.prev', c).click(); };
  });
}

/* Visor ampliado: clic/toque en cualquier foto de una galería. Flechas, teclado, deslizar y Esc. */
function initLightbox() {
  const box = document.createElement('div');
  box.className = 'lb'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Visor de fotos');
  box.innerHTML = '<button class="lb-x" aria-label="Cerrar">×</button><button class="lb-p" aria-label="Anterior">‹</button><div class="lb-m"></div><button class="lb-n" aria-label="Siguiente">›</button>';
  document.body.append(box);
  let items = [], i = 0, x0 = 0;
  const show = () => {
    const el = items[i].querySelector('img,video');
    $('.lb-m', box).innerHTML = el.tagName === 'IMG' ? `<img src="${esc(el.currentSrc || el.src)}" alt="${esc(el.alt)}">` : `<video src="${esc(el.src)}" controls autoplay playsinline></video>`;
  };
  const go = (d) => { i = (i + d + items.length) % items.length; show(); };
  const close = () => { box.hidden = true; $('.lb-m', box).innerHTML = ''; document.body.style.overflow = ''; };
  document.addEventListener('click', (e) => {
    const f = e.target.closest('.gallery figure'); if (!f) return;
    items = [...f.parentElement.children]; i = items.indexOf(f); show(); box.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-x', box).focus();
  });
  $('.lb-x', box).onclick = close; $('.lb-p', box).onclick = () => go(-1); $('.lb-n', box).onclick = () => go(1);
  box.onclick = (e) => { if (e.target === box || e.target.classList.contains('lb-m')) close(); };
  addEventListener('keydown', (e) => { if (box.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
  box.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
}

function initForm() {
  const form = $('#form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const msg = $('.msg', form), btn = $('button', form), f = Object.fromEntries(new FormData(form));
    msg.className = 'msg'; btn.disabled = true; msg.textContent = 'Enviando…';
    try {
      if (!f.name?.trim() || !/^\S+@\S+\.\S+$/.test(f.email || '') || !f.message?.trim()) throw new Error('Revisa nombre, correo y mensaje.');
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(f).toString() });
      if (!res.ok) throw new Error('No se pudo enviar el mensaje. Intenta por WhatsApp.');
      form.reset(); msg.textContent = 'Mensaje enviado. Te responderé pronto.'; msg.classList.add('ok');
    } catch (err) { msg.textContent = err.message || 'Error de conexión.'; msg.classList.add('err'); }
    btn.disabled = false;
  };
}

function initChrome(d) {
  const nav = $('#nav'), burger = $('#burger'), header = $('#header');
  burger.onclick = () => burger.setAttribute('aria-expanded', nav.classList.toggle('open'));
  nav.onclick = (e) => { if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } };
  const onScroll = () => header.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const wa = $('#wa');
  if (d.whatsapp?.enabled && d.whatsapp.number) { wa.href = waLink(d.whatsapp.number, d.whatsapp.message); wa.hidden = false; }
}

(function init() {
  try { // la página ya viene construida por build.mjs; aquí solo se activan las interacciones
    const d = JSON.parse($('#cfg').textContent);
    initChrome(d); initHero(d.hero?.interval); initCarousels(); initLightbox(); initForm();
  } catch (err) { console.error(err); }
})();
