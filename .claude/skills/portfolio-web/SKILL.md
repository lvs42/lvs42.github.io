---
name: portfolio-web
description: Diseñar, maquetar y redactar la web-portfolio personal (GitHub Pages, HTML/CSS/JS estático) orientada a conseguir trabajo como Data Scientist / Data Analyst / ML Engineer. Usar al crear o rediseñar secciones (hero, sobre mí, proyectos, skills, experiencia, CV, contacto), elegir estilo visual, layout responsive, o redactar textos para recruiters. Triggers - "portfolio", "página web", "web personal", "sección", "hero", "landing", "rediseño", "currículum en la web".
---

# Web-portfolio para Data Science

Contexto: sitio estático en GitHub Pages (`index.html`, `css/main.css`, `media/`). Sin build step: HTML + CSS + JS vanilla; librerías solo por CDN con versión fijada (ej. `aos@2.3.4`, `gsap@3.12.5`). No introducir frameworks (React, etc.) salvo que el usuario lo pida.

## Objetivo de la web
Un recruiter dedica ~30 s. En ese tiempo debe saber: **quién eres, qué rol buscas, qué sabes hacer y una prueba de ello**. Todo diseño se evalúa contra eso.

## Estructura recomendada (en este orden)
1. **Hero**: nombre, rol objetivo ("Data Scientist · Máster en Ciencia de Datos"), una frase de valor ("Convierto datos en decisiones: ML, análisis y visualización"), 2 CTAs: *Ver proyectos* y *Descargar CV (PDF)*. Enlaces a GitHub y LinkedIn visibles.
2. **Proyectos destacados** (3–6, lo más importante de la web): tarjetas con imagen/gráfico, título orientado a resultado, 1 línea de problema, stack (chips), métrica clave, enlaces a repo / notebook / demo. Ver skill `ds-project-showcase`.
3. **Skills**: agrupadas (Lenguajes: Python, SQL, R · ML: scikit-learn, XGBoost, PyTorch · Datos: pandas, Spark · Viz: Matplotlib, Plotly, Power BI/Tableau · Herramientas: Git, Docker, cloud). Nada de barras de porcentaje: no significan nada para un recruiter.
4. **Sobre mí**: 3–4 frases, trayectoria → máster → qué busco. Foto profesional opcional.
5. **Experiencia / Formación**: timeline compacta (máster, TFG/TFM, prácticas, trabajos).
6. **Contacto**: email (`mailto:`), LinkedIn, GitHub. Formulario solo con un servicio estático (Formspree): GitHub Pages no tiene backend.

## Redacción
- Verbos de acción + resultado cuantificado: "Modelo de churn con XGBoost, AUC 0.87, +12% recall frente al baseline".
- Evitar frases vacías ("apasionada por los datos"). Concreto > adjetivos.
- Coherencia de idioma: todo en español, todo en inglés, o selector ES/EN. Mezclar (como ahora "About me" + "Currículum") resta profesionalidad. Para mercado internacional, inglés.
- Palabras clave de ofertas reales (ATS/LinkedIn): Machine Learning, Python, SQL, EDA, feature engineering, A/B testing, dashboards, NLP… solo las que se dominan.

## Diseño visual
- Paleta: 1 color de acento + neutros. Tokens en `:root` (`--bg`, `--fg`, `--accent`, `--muted`) y soporte de `prefers-color-scheme: dark`.
- Tipografía: 1–2 familias (ej. Inter / Space Grotesk para títulos, JetBrains Mono para detalles "tech"). Escala fluida con `clamp()`.
- Layout: CSS Grid para tarjetas (`repeat(auto-fill, minmax(280px, 1fr))`), Flexbox para nav. Mobile-first, sin scroll horizontal, gutter ≥ 16px.
- Espaciado generoso, máx. ~70ch de ancho de texto.
- Estética "data": fondo sutil de grid/puntos, mini-gráfico animado en el hero, o tipografía mono para métricas. Sin saturar.

## Reglas técnicas
- HTML semántico: `<header> <nav> <main> <section id="..."> <footer>`, un solo `<h1>`.
- `<title>` y `<meta name="description">` reales (no "Game"). Open Graph para que el enlace se vea bien en LinkedIn. Ver `web-quality`.
- Imágenes en `media/`, comprimidas (WebP/AVIF, < 300 KB), con `alt`, `width`/`height` y `loading="lazy"` salvo la del hero.
- CV en PDF enlazado con `download`.
- Animaciones: ver skill `web-animations`.

## Flujo de trabajo
1. Leer `index.html` y `css/main.css` antes de cambiar nada; reutilizar clases existentes.
2. Cambios por sección, verificando en móvil (≤ 400px) y escritorio.
3. Probar en local (`python -m http.server 8000`).
4. Al terminar una sección, pasar el checklist de `web-quality`.
