---
name: ds-project-showcase
description: Presentar proyectos de ciencia de datos (notebooks de Jupyter/Colab, TFG/TFM, modelos ML, análisis, dashboards) en la web-portfolio como casos de estudio que convenzan a recruiters y técnicos. Usar al añadir un proyecto, convertir un .ipynb a página/HTML, crear tarjetas de proyecto, escribir el README de un repo, o incrustar gráficos interactivos (Plotly, Altair) o demos (Streamlit, Hugging Face Spaces).
---

# Mostrar proyectos de Data Science

## Selección
3–6 proyectos, calidad > cantidad. Mezcla ideal: 1 ML end-to-end, 1 análisis/EDA con insights de negocio, 1 visualización/dashboard, 1 diferenciador (NLP, series temporales, deep learning, TFM). Priorizar datos reales y problemas con sentido de negocio frente a Titanic/Iris.

## Tarjeta (en la home)
- Imagen: el mejor gráfico del proyecto (no un logo genérico), WebP, 16:9.
- Título orientado a resultado: "Predicción de éxito de películas" > "Práctica módulo 2".
- 1 frase: problema → enfoque → resultado.
- Chips de stack: `Python` `pandas` `scikit-learn`…
- Métrica destacada (R², AUC, MAE, % de mejora, nº de registros).
- Enlaces: Repo · Notebook · Demo (los que existan).

## Página de caso de estudio (opcional, `proyectos/<slug>.html`)
1. **Contexto y pregunta**: qué problema y por qué importa.
2. **Datos**: fuente, tamaño, limpieza relevante.
3. **Enfoque**: EDA, features, modelos probados, validación (CV, split temporal).
4. **Resultados**: métricas vs baseline, 2–3 gráficos clave, interpretación (SHAP / feature importance).
5. **Conclusiones y siguientes pasos**: limitaciones honestas.
6. **Stack y enlaces.**
Secciones 1 y 4 claras para un recruiter; 2–3 con detalle para el entrevistador técnico.

## Notebooks → web
- Limpiar antes de publicar: celdas de prueba, outputs enormes, rutas locales, claves/API keys, datos personales.
- Exportar: `jupyter nbconvert --to html --no-input mi.ipynb` (versión informe) o con código. Guardar en `media/Proyectos/` y enlazar.
- Alternativas: nbviewer (`https://nbviewer.org/github/lvs42/<repo>/blob/main/<nb>.ipynb`) o badge "Open in Colab".
- Notebooks pesados (como `PELICULAS_Practica_modulo2.ipynb`, ~800 KB): no incrustar; exportar solo los gráficos clave como imágenes.

## Gráficos interactivos
- Plotly: `fig.write_html("media/Proyectos/x.html", include_plotlyjs="cdn", full_html=False)` e incrustar con `<iframe loading="lazy">`, o exportar a imagen para la tarjeta.
- Al crear o rediseñar gráficos, usar la skill `dataviz` (colores, accesibilidad, modo oscuro).
- Demos: Streamlit Community Cloud o Hugging Face Spaces, enlazadas (GitHub Pages no ejecuta Python).

## README de cada repo (los recruiters también llegan por GitHub)
Título + 1 línea, imagen/gif, problema, resultados, cómo ejecutar (`requirements.txt`), estructura, autoría con enlace al portfolio. Fijar (pin) los mejores repos en el perfil de GitHub y crear el README de perfil (`lvs42/lvs42`).

## TFG/TFM
Destacarlo: resumen de 3 líneas, aportación principal, PDF descargable y, si existen, slides de la defensa.
