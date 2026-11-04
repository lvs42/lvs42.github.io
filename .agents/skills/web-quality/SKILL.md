---
name: web-quality
description: Checklist de calidad antes de publicar la web-portfolio en GitHub Pages - SEO, metadatos/Open Graph (vista previa en LinkedIn), accesibilidad (WCAG), rendimiento (Lighthouse, peso de imágenes), responsive, enlaces rotos y despliegue. Usar al terminar cambios, antes de hacer push, o cuando se pida "revisar la web", "optimizar", "SEO", "Lighthouse", "accesibilidad", "publicar", "deploy".
---

# Calidad y publicación

## SEO y metadatos (en `<head>`)
```html
<html lang="es">  <!-- o "en", coherente con el contenido -->
<title>Nombre Apellido · Data Scientist</title>
<meta name="description" content="Data Scientist con Máster en Ciencia de Datos. Proyectos de ML, análisis y visualización con Python y SQL.">
<link rel="canonical" href="https://lvs42.github.io/">
<meta property="og:title" content="Nombre Apellido · Data Scientist">
<meta property="og:description" content="...">
<meta property="og:image" content="https://lvs42.github.io/media/og.png"> <!-- 1200x630 -->
<meta property="og:url" content="https://lvs42.github.io/">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="media/icon/favicon.svg">
```
Opcional: JSON-LD `Person` (name, jobTitle, url, sameAs: [LinkedIn, GitHub]).

## Accesibilidad
- Contraste ≥ 4.5:1 en texto (cuidado con el cian `#00FFFF` sobre fondos claros).
- Imágenes con `alt` descriptivo (decorativas: `alt=""`).
- Navegable con teclado: `:focus-visible` visible; menú móvil con `<button aria-expanded>` (no `<div onclick>`).
- Encabezados sin saltos de nivel; textos de enlace comprensibles fuera de contexto.
- `prefers-reduced-motion` respetado (ver `web-animations`).

## Rendimiento
- Imágenes: el repo tiene PNG de 3–7 MB (`game.png`, `game-mobile.png`, `media/bg1.png`). Convertir a WebP/AVIF y redimensionar (máx. ~1920px de ancho, < 300 KB), p. ej. `cwebp -q 80 in.png -o out.webp`.
- `loading="lazy"` y `width/height` en imágenes; `defer` en scripts.
- Pocas dependencias por CDN, siempre con versión fija.
- Objetivo Lighthouse: ≥ 90 en Performance, Accessibility, Best Practices y SEO.

## Responsive
Probar a 360px, 768px y 1440px. Sin scroll horizontal; objetivos táctiles ≥ 44px.

## Limpieza del repo
- `.vs/` (índices de Visual Studio) no debería versionarse: añadir a `.gitignore` y `git rm -r --cached .vs`.
- Nada de datos sensibles, claves o rutas locales en notebooks.

## Despliegue (GitHub Pages)
- Repo `lvs42.github.io`, rama `main` → se publica en `https://lvs42.github.io` 1–2 min después del push.
- Antes del push: probar en local (`python -m http.server 8000`), consola sin errores, todos los `href`/`src` apuntan a archivos existentes (GitHub Pages distingue mayúsculas: `Proyectos/` ≠ `proyectos/`).
- Commit/push solo cuando el usuario lo pida.
