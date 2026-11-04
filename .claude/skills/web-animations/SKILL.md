---
name: web-animations
description: Añadir animaciones y micro-interacciones a páginas web estáticas (CSS transitions/keyframes, AOS, GSAP + ScrollTrigger, IntersectionObserver, contadores, typing effect, hover en tarjetas, fondos animados con canvas/partículas, gráficos que se dibujan al hacer scroll). Usar cuando se pida "animación", "efecto", "scroll", "transición", "hover", "parallax", "que aparezca", "más dinámica", "fade", "reveal".
---

# Animaciones web

Principio: la animación **guía la atención**, no la distrae. En un portfolio profesional: sutil, rápida (150–600 ms), con propósito. Si un recruiter tiene que esperar a una animación para leer, sobra.

## Elegir la herramienta (de más simple a más potente)
1. **CSS puro** (`transition`, `@keyframes`): hovers, botones, menú, loaders. Siempre la primera opción.
2. **IntersectionObserver + clase CSS**: reveal al hacer scroll sin librerías (~10 líneas). Preferido sobre AOS para cosas nuevas.
3. **AOS** (ya incluido en el sitio): `data-aos="fade-up"`. Fijar versión (`https://unpkg.com/aos@2.3.4/dist/aos.css` y `aos.js`); ahora usa `aos@next`, que no es estable. `AOS.init({ once: true, duration: 600 })`.
4. **GSAP + ScrollTrigger** (cdnjs, `gsap@3.12.5`): timelines, pinning, scrub, secuencias del hero. Solo si CSS/IO no alcanza.
5. **Canvas / SVG animado**: fondos (red de nodos tipo grafo, partículas), gráficos que se dibujan (`stroke-dasharray`/`stroke-dashoffset`). Muy apropiado para un perfil de datos.

## Patrones listos

Reveal al hacer scroll:
```html
<style>
.js .reveal{opacity:0;transform:translateY(24px);transition:opacity var(--dur) var(--ease),transform var(--dur) var(--ease)}
.js .reveal.is-visible{opacity:1;transform:none}
</style>
<script>
document.documentElement.classList.add('js');
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
</script>
```
Escalonado: `style="--i:2"` en cada tarjeta y `transition-delay: calc(var(--i) * 80ms)`.

Contador de métricas ("15 proyectos", "AUC 0.87"): `requestAnimationFrame` al entrar en viewport, easing `1 - (1 - t) ** 3`, ~1 s.

Línea de gráfico que se dibuja:
```css
.chart path{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);transition:stroke-dashoffset 1.5s var(--ease)}
.is-visible .chart path{stroke-dashoffset:0}
```
(`--len` = `path.getTotalLength()` desde JS.)

Hover de tarjeta: `transform: translateY(-4px)` + sombra, `transition: .2s`. Nunca escalar texto.

Typing effect del rol en el hero: aceptable una vez, sin bucle infinito, con el texto completo en el HTML (accesible y SEO).

## Reglas obligatorias
- **Accesibilidad**: respetar `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
  ```
  En JS: `matchMedia('(prefers-reduced-motion: reduce)').matches` → mostrar el estado final. Con GSAP, `gsap.matchMedia()`.
- **Rendimiento**: animar solo `transform` y `opacity`. Nunca `top/left/width/height/box-shadow` en bucle. `will-change` solo puntual. Canvas: pausar con `document.hidden` y fuera del viewport; menos partículas en móvil.
- **Contenido visible sin JS**: nada queda en `opacity:0` si el script falla (por eso el prefijo `.js`).
- Nada de parpadeos > 3/s ni autoplay con sonido.
- Máximo un efecto "wow" (hero); el resto, reveals sutiles y coherentes: en `:root` definir `--ease: cubic-bezier(.2,.7,.2,1)` y `--dur: .6s` y usarlos en toda la web.

## Verificación
Probar en móvil, con reduced motion emulado (DevTools → Rendering → prefers-reduced-motion) y en Lighthouse (sin CLS provocado por animaciones).
