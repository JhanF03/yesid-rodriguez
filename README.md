# Portafolio de fotógrafo – versión estática para Netlify

Sin servidor, sin base de datos. Todo el contenido vive en `data/site.json`.

## Cómo funciona
| Antes (Node/Express) | Ahora (gratis) |
|---|---|
| `GET /api/site` + pre-render en cada visita | `build.mjs` pre-renderiza **una vez** al desplegar (SEO igual) |
| Correo con SMTP (nodemailer) | **Netlify Forms** (100 envíos/mes gratis, filtro antispam) |
| Panel con contraseña que escribía `site.json` | Panel que **descarga** `site.json` o lo **publica en GitHub** → Netlify redespliega solo |

## 1. Poner TU contenido
Reemplaza `data/site.json` por el tuyo (el original). Puedes dejar el bloque `smtp`: el build **lo elimina** y nunca se publica.
Copia tus imágenes a `public/assets/img/`.

## 2. Probar en local (Node 18+, sin instalar nada)
```bash
npm run dev      # http://localhost:3000  |  panel: /admin/
```
(El formulario solo envía correos cuando está desplegado en Netlify.)

## 3. Desplegar en Netlify
**Opción A – Git (recomendada, necesaria para el panel):**
1. Sube la carpeta a un repositorio de GitHub.
2. Netlify → *Add new site → Import from Git*. Toma `netlify.toml` solo (build `node build.mjs`, publish `dist`).
3. *Site settings → Forms → Form notifications → Add → Email notification* y pon tu correo.

**Opción B – Arrastrar y soltar:** `npm run build` y arrastra la carpeta `dist/` a Netlify Drop. (El formulario también funciona; el panel solo con "Descargar".)

## 4. Editar contenido
Entra a `tudominio/admin/`.
- **Descargar site.json** → reemplaza `data/site.json` y vuelve a desplegar.
- **Publicar cambios** → completa una vez *Publicación (GitHub)*: repo `usuario/repo`, rama y un [token fino](https://github.com/settings/personal-access-tokens/new) limitado a ese repo con permiso *Contents: Read and write*. El token se guarda solo en tu navegador.

El panel ya no pide contraseña: no tiene secretos y no puede modificar nada sin tu token de GitHub.

## Variables opcionales
`SITE_URL` (dominio propio, para sitemap y Open Graph). Si no la defines, Netlify usa su variable `URL`.
