(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };

  /* ---------------- i18n ---------------- */
  const EN = window.I18N_EN || {};
  const ES = {};
  $$('[data-i18n]').forEach(el => { ES[el.dataset.i18n] = el.textContent; });
  $$('[data-i18n-html]').forEach(el => { ES[el.dataset.i18nHtml] = el.innerHTML; });
  // Page metadata: Spanish comes from the document, English from <meta name="x-title-en|x-desc-en">
  const metaEn = n => { const m = $(`meta[name="${n}"]`); return m ? m.content : null; };
  const desc = $('meta[name="description"]');
  const META = {
    es: { title: document.title, desc: desc && desc.content, cv: 'CV_Lucila_Vazquez_ES.pdf', btn: 'EN', btnLabel: 'Change language to English' },
    en: { title: metaEn('x-title-en') || document.title, desc: metaEn('x-desc-en') || (desc && desc.content), cv: 'CV_Lucila_Vazquez.pdf', btn: 'ES', btnLabel: 'Cambiar idioma a español' },
  };
  let lang = 'es';
  let chart = null;
  // shared with page scripts (charts on the project pages)
  window.site = { get lang() { return lang; }, t: k => (lang === 'en' ? EN : ES)[k] };

  function setLang(l) {
    lang = l;
    const dict = l === 'en' ? EN : ES;
    $$('[data-i18n]').forEach(el => { const v = dict[el.dataset.i18n]; if (v != null) el.textContent = v; });
    $$('[data-i18n-html]').forEach(el => { const v = dict[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
    $$('[data-i18n-alt]').forEach(el => { const v = dict[el.dataset.i18nAlt]; if (v != null) el.alt = v; });
    const m = META[l];
    document.documentElement.lang = l;
    document.title = m.title;
    if (desc && m.desc) desc.content = m.desc;
    $$('.cv-link').forEach(a => { a.href = a.getAttribute('href').replace(/CV_Lucila_Vazquez(_ES)?\.pdf$/, m.cv); });
    const b = $('#lang'); if (b) { b.textContent = m.btn; b.setAttribute('aria-label', m.btnLabel); }
    chart && chart.render(true);
    document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  }
  $$('[data-i18n-alt]').forEach(el => { ES[el.dataset.i18nAlt] = el.alt; });
  const saved = store.get('lang');
  const browserEs = (navigator.languages || [navigator.language]).some(x => /^es\b/i.test(x || ''));
  setLang(saved || (browserEs ? 'es' : 'en'));
  if ($('#lang')) $('#lang').addEventListener('click', () => { setLang(lang === 'es' ? 'en' : 'es'); store.set('lang', lang); });

  /* ---------------- nav ---------------- */
  const nav = $('.nav'), toggle = $('.nav__toggle'), menu = $('#menu');
  if (toggle && menu) {
    const closeMenu = () => { toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open);
    });
    menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }
  const bg = $('.bg-plot');
  let fade = '';
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', scrollY > 8);
    const f = Math.min(1, scrollY / (innerHeight * .7)).toFixed(2);
    if (bg && f !== fade) { fade = f; bg.style.setProperty('--plot-fade', f); } // on the canvas only: cheap restyle
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const links = $$('.nav__menu a');
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + e.target.id && a.pathname === location.pathname)));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------------- TFM chart (dot plot) ---------------- */
  const DATA = {
    acc:  { ref: [89.64, 92.24, 93.24], aug: [90.76, 93.19, 94.38], cbam: [91.80, 93.46, 94.70] },
    sens: { ref: [89.61, 91.50, 92.11], aug: [90.77, 92.55, 93.44], cbam: [91.94, 92.56, 93.65] },
    spec: { ref: [89.66, 92.69, 93.97], aug: [90.76, 93.58, 95.00], cbam: [91.70, 94.01, 95.38] },
  };
  const SIZES = [80, 120, 160];
  const SERIES = [
    { key: 'ref', color: 'var(--s1)', label: () => (lang === 'en' ? EN : ES)['viz.ref'] },
    { key: 'aug', color: 'var(--s2)', label: () => (lang === 'en' ? EN : ES)['viz.aug'] },
    { key: 'cbam', color: 'var(--s3)', label: () => 'CBAM' },
  ];
  chart = (() => {
    const root = $('#tfm-viz'); if (!root) return null;
    const svg = $('svg', root), tip = $('.tip', root), tbody = $('tbody', root);
    const NS = 'http://www.w3.org/2000/svg';
    const W = 520, M = { l: 64, r: 52, t: 24, b: 30 }, ROW = 54, H = M.t + ROW * 3 + M.b;
    const X0 = 88, X1 = 96, x = v => M.l + (v - X0) / (X1 - X0) * (W - M.l - M.r);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const mk = (tag, attrs, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };

    const axis = mk('g', { class: 'axis' });
    for (let v = X0; v <= X1; v += 2) {
      mk('line', { class: 'gridline', x1: x(v), x2: x(v), y1: M.t - 6, y2: H - M.b + 4 }, axis);
      mk('text', { x: x(v), y: H - 8, 'text-anchor': 'middle' }, axis).textContent = v;
    }
    const rows = SIZES.map((s, i) => {
      const cy = M.t + ROW * i + ROW / 2;
      mk('text', { class: 'row-lbl', x: 0, y: cy + 4 }).textContent = s + ' px';
      const track = mk('rect', { class: 'track-r', x: 0, y: -1, width: 1, height: 2, fill: 'var(--line)' });
      const dots = SERIES.map(se => mk('circle', { class: 'dot', r: 6, cx: 0, cy: 0, fill: se.color }));
      const val = mk('text', { class: 'val', x: 0, y: 0 });
      return { cy, track, dots, val };
    });
    // hit targets (on top, bigger than marks, keyboard-focusable)
    const hits = rows.map((r, i) => SERIES.map((se, j) => {
      const h = mk('circle', { class: 'hit', r: 13, cx: 0, cy: 0, tabindex: 0 });
      const show = () => showTip(i, j);
      h.addEventListener('pointerenter', show); h.addEventListener('focus', show);
      h.addEventListener('pointerleave', hideTip); h.addEventListener('blur', hideTip);
      return h;
    }));
    let metric = 'acc';
    const fmtv = v => v.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 2 });

    function showTip(i, j) {
      const d = DATA[metric], v = d[SERIES[j].key][i];
      // list every series sitting on (almost) the same spot, so overlapping dots stay readable
      const near = SERIES.map((se, k) => ({ se, v: d[se.key][i] })).filter(o => Math.abs(x(o.v) - x(v)) < 12);
      tip.innerHTML = `${SIZES[i]} px · ` + near.map(o => `${o.se.label()} <b>${fmtv(o.v)} %</b>`).join(' · ');
      const box = svg.getBoundingClientRect(), k = box.width / W;
      tip.style.left = x(v) * k + 'px'; tip.style.top = rows[i].cy * k + 'px';
      tip.hidden = false;
      rows[i].dots[j].style.stroke = 'var(--fg)';
    }
    function hideTip() { tip.hidden = true; rows.forEach(r => r.dots.forEach(d => (d.style.stroke = ''))); }

    function render(instant) {
      const d = DATA[metric];
      rows.forEach((r, i) => {
        const vals = SERIES.map(se => d[se.key][i]);
        const lo = Math.min(...vals), hi = Math.max(...vals);
        r.track.style.transform = `translate(${x(lo)}px, ${r.cy}px) scaleX(${x(hi) - x(lo)})`;
        // draw best last so it sits on top
        SERIES.forEach((se, j) => {
          const t = `translate(${x(vals[j])}px, ${r.cy}px)`;
          r.dots[j].style.transform = t; hits[i][j].style.transform = t;
          hits[i][j].setAttribute('aria-label', `${SIZES[i]} px, ${se.label()}: ${fmtv(vals[j])} %`);
        });
        r.val.textContent = fmtv(hi);
        r.val.style.transform = `translate(${x(hi) + 12}px, ${r.cy + 4}px)`;
      });
      tbody.innerHTML = SIZES.map((s, i) => `<tr><td>${s}</td>${SERIES.map(se => `<td>${fmtv(d[se.key][i])}</td>`).join('')}</tr>`).join('');
      if (instant) hideTip();
    }
    $$('.seg button', root).forEach(b => b.addEventListener('click', () => {
      metric = b.dataset.metric;
      $$('.seg button', root).forEach(o => o.setAttribute('aria-checked', String(o === b)));
      render();
    }));
    // first paint without animation
    svg.querySelectorAll('.dot, .val').forEach(n => (n.style.transition = 'none'));
    render(true);
    requestAnimationFrame(() => requestAnimationFrame(() => svg.querySelectorAll('.dot, .val').forEach(n => (n.style.transition = ''))));
    return { render };
  })();
  chart && chart.render(true);

  /* ---------------- page background: animated "data science" plot ----------------
     One point cloud on a faint chart grid that morphs through six scenes:
     histogram, linear regression, k-means, classification, gradient descent and
     neural network, returning to the raw cloud between each. Each has an overlay and a caption. */
  const canvas = $('.bg-plot');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, P = { x0: 0, x1: 0, y0: 0, y1: 0 }, pts = [], raf = 0;
    let scene = 0, sceneT = 0, prog = 0, last = 0, lastW = 0, nnEdges = [], extra = {};
    const gridLayer = document.createElement('canvas'), gctx = gridLayer.getContext('2d'); let dprNow = 1;
    const C = {};
    const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const readColors = () => { ['--accent', '--s1', '--s2', '--s3', '--grid', '--fg', '--muted'].forEach(k => (C[k] = css(k))); };
    const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const clamp = (v, a = .02, b = .98) => Math.min(b, Math.max(a, v));
    const px = u => P.x0 + u * (P.x1 - P.x0), py = v => P.y0 + v * (P.y1 - P.y0);

    const CAPTIONS = {
      es: ['datos en bruto · n = {n}', 'histograma · densidad normal', 'regresión lineal · mínimos cuadrados', 'k-means · k = 3',
           'clasificación · frontera de decisión', 'descenso de gradiente · función de pérdida', 'red neuronal · imagen → predicción'],
      en: ['raw data · n = {n}', 'histogram · normal density', 'linear regression · least squares', 'k-means · k = 3',
           'classification · decision boundary', 'gradient descent · loss function', 'neural network · image → prediction'],
    };
    const SCENES = 7, HOLD = 8000, BASE_HOLD = 22000; // ms per scene; the raw cloud (0) is the base between scenes
    const ORDER = [0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6]; let seq = 0;

    // scene constants (normalised plot coords, y grows downward)
    const CENTERS = [[.25, .68], [.55, .3], [.8, .7]];
    const SLOPE = -.62, ICPT = .82;
    const HIST = { bins: 17, x0: .12, x1: .88, base: .94, mu: .5, sd: .13 };
    const boundary = x => .5 + .17 * Math.sin(x * Math.PI * 2 * 1.15 + .6);
    const GD = { cx: .62, cy: .52, rot: -.45, a: 1, b: 5 };
    const LAYERS = [5, 7, 7, 3], LX = [.46, .6, .74, .88];

    const rotate = (u, v) => [GD.cx + u * Math.cos(GD.rot) - v * Math.sin(GD.rot), GD.cy + u * Math.sin(GD.rot) + v * Math.cos(GD.rot)];

    function targets(s) {
      const n = pts.length;
      pts.forEach(p => { p.role = 'pt'; p.alpha = .75; p.layer = -1; });
      if (s === 0) pts.forEach(p => { p.tx = .5 + gauss() * .2; p.ty = .5 + gauss() * .2; });

      else if (s === 1) { // histogram: stack points into bins of a normal sample
        const bw = (HIST.x1 - HIST.x0) / HIST.bins, counts = new Array(HIST.bins).fill(0);
        const step = 9.5 / (P.y1 - P.y0);
        extra.hist = { bw, step };
        pts.forEach(p => {
          const v = clamp(HIST.mu + gauss() * HIST.sd, HIST.x0, HIST.x1 - 1e-6);
          const b = Math.floor((v - HIST.x0) / bw);
          p.tx = HIST.x0 + (b + .5) * bw; p.ty = HIST.base - (counts[b]++ + .5) * step;
        });
      }

      else if (s === 2) pts.forEach((p, i) => { const u = .06 + (i / n) * .88; p.tx = u; p.ty = ICPT + SLOPE * u + gauss() * .05; });

      else if (s === 3) pts.forEach(p => { const c = CENTERS[p.k]; p.tx = c[0] + gauss() * .065; p.ty = c[1] + gauss() * .07; });

      else if (s === 4) { // two classes separated by a non-linear boundary, a few misclassified
        pts.forEach(p => {
          const x = .03 + Math.random() * .94;
          let y = .05 + Math.random() * .9;
          const d = y - boundary(x);
          if (Math.abs(d) < .045) y += Math.sign(d || 1) * .045;
          p.tx = x; p.ty = y; p.cls = (y - boundary(x)) > 0 ? 1 : 0;
          if (Math.random() < .04) p.cls = 1 - p.cls;
        });
      }

      else if (s === 5) { // points sit on loss contours (rotated ellipses)
        const R = 7, tot = (R * (R + 1)) / 2;
        let i = 0;
        for (let j = 0; j < R; j++) {
          const m = j === R - 1 ? n - i : Math.round(n * (j + 1) / tot), ru = .055 * (j + 1), rv = ru * Math.sqrt(GD.a / GD.b);
          for (let q = 0; q < m && i < n; q++, i++) {
            const t = (q / m) * Math.PI * 2 + j * .4, xy = rotate(Math.cos(t) * ru, Math.sin(t) * rv);
            pts[i].tx = xy[0]; pts[i].ty = xy[1]; pts[i].alpha = .5;
          }
        }
        // gradient-descent path with a learning rate high enough to zig-zag
        let u = -.36, v = .16;
        const path = [rotate(u, v)];
        for (let k = 0; k < 16; k++) { u -= .16 * 2 * GD.a * u; v -= .16 * 2 * GD.b * v; path.push(rotate(u, v)); }
        extra.path = path;
      }

      else if (s === 6) { // input "image" grid -> layers of nodes -> output
        const nodes = [], total = LAYERS.reduce((a, b) => a + b, 0), maxL = Math.max(...LAYERS);
        LAYERS.forEach((cnt, l) => { for (let j = 0; j < cnt; j++) nodes.push([LX[l], .5 + (j - (cnt - 1) / 2) * (.62 / maxL), l]); });
        const rest = n - total, gx0 = .05, gx1 = .3, gy0 = .22, gy1 = .78;
        const aspect = ((gx1 - gx0) * (P.x1 - P.x0)) / ((gy1 - gy0) * (P.y1 - P.y0));
        const cols = Math.max(2, Math.round(Math.sqrt(rest * aspect))), rows = Math.max(2, Math.ceil(rest / cols));
        pts.forEach((p, i) => {
          if (i < total) {
            const nd = nodes[i];
            p.tx = nd[0]; p.ty = nd[1]; p.layer = nd[2]; p.alpha = .9;
            p.role = nd[2] === LAYERS.length - 1 ? 'out' : 'node';
          } else {
            const g = i - total, c = g % cols, r = Math.floor(g / cols), cx = c / (cols - 1), cy = r / (rows - 1);
            p.tx = gx0 + cx * (gx1 - gx0); p.ty = gy0 + cy * (gy1 - gy0);
            const d = (cx - .55) ** 2 + (cy - .45) ** 2; // a soft "cell" blob as the image content
            p.alpha = .12 + .8 * Math.exp(-d / .06);
          }
        });
        nnEdges = [];
        const idx = l => pts.map((p, i) => i).filter(i => pts[i].layer === l);
        for (let l = 0; l < LAYERS.length - 1; l++) idx(l).forEach(a => idx(l + 1).forEach(b => nnEdges.push([a, b])));
        extra.firstLayer = idx(0); extra.grid = [gx1, gy0, gy1];
      }
      pts.forEach(p => { p.tx = clamp(p.tx); p.ty = clamp(p.ty); });
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.5), r = canvas.getBoundingClientRect(); dprNow = dpr;
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = { x0: w * .04, x1: w * .96, y0: h * .08, y1: h * .9 };
      buildGrid();
      if (pts.length && w === lastW) { draw(last || 0); return; } // height-only change (mobile URL bar): keep points
      lastW = w;
      const n = Math.round(Math.min(220, Math.max(80, (w * h) / 7000)));
      pts = Array.from({ length: n }, (_, i) => ({ k: i % 3, x: .5, y: .5, tx: .5, ty: .5, r: 2.4 + Math.random() * 1.6, ph: Math.random() * 6.28, alpha: .75 }));
      targets(scene); pts.forEach(p => { p.x = p.tx; p.y = p.ty; });
      prog = 1; draw(0);
    }

    function buildGrid() { // light chart gridlines, rendered once per resize/theme and blitted each frame
      gridLayer.width = canvas.width; gridLayer.height = canvas.height;
      gctx.setTransform(dprNow, 0, 0, dprNow, 0, 0);
      const step = Math.max(64, Math.round(Math.min(w, h) / 6));
      const ox = (w % step) / 2, oy = (h % step) / 2;
      gctx.strokeStyle = C['--grid']; gctx.lineWidth = 1;
      gctx.beginPath();
      for (let x = ox; x <= w; x += step) { const X = Math.round(x) + .5; gctx.moveTo(X, 0); gctx.lineTo(X, h); }
      for (let y = oy; y <= h; y += step) { const Y = Math.round(y) + .5; gctx.moveTo(0, Y); gctx.lineTo(w, Y); }
      gctx.stroke();
    }
    const grid = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(gridLayer, 0, 0); ctx.setTransform(dprNow, 0, 0, dprNow, 0, 0); };

    const colorOf = p => {
      if (scene === 3) return C[['--s1', '--s2', '--s3'][p.k]];
      if (scene === 4) return C[p.cls ? '--s2' : '--s1'];
      if (scene === 6 && p.role === 'out') return C['--s3'];
      if (scene === 6 && p.role === 'node') return C['--s1'];
      return C['--accent'];
    };
    const line = (list, color, width, alpha, dash) => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; ctx.setLineDash(dash || []);
      ctx.beginPath();
      list.forEach((q, i) => (i ? ctx.lineTo(px(q[0]), py(q[1])) : ctx.moveTo(px(q[0]), py(q[1]))));
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    };
    // sample f on [a, a + (b - a) * t] so curves draw progressively
    const sampled = (f, a, b, t, N = 80) => {
      const m = Math.max(2, Math.round(N * t)), out = [];
      for (let i = 0; i < m; i++) { const x = a + (b - a) * t * (i / (m - 1)); out.push([x, f(x)]); }
      return out;
    };

    function overlay(time) {
      const t = prog;
      if (scene === 1 && t > 0 && extra.hist) { // normal density scaled to expected bin counts
        const bw = extra.hist.bw, step = extra.hist.step, n = pts.length;
        const f = x => HIST.base - n * bw * Math.exp(-((x - HIST.mu) ** 2) / (2 * HIST.sd ** 2)) / (HIST.sd * Math.sqrt(2 * Math.PI)) * step;
        line(sampled(f, HIST.x0, HIST.x1, t), C['--s2'], 2.5, .9);
      }
      if (scene === 2 && t > 0) line(sampled(u => ICPT + SLOPE * u, .04, .96, t, 2), C['--s2'], 2.5, 1);
      if (scene === 3) {
        ctx.lineWidth = 2.5;
        CENTERS.forEach((c, k) => {
          const x = px(c[0]), y = py(c[1]), s = 7;
          ctx.strokeStyle = C[['--s1', '--s2', '--s3'][k]];
          ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke();
        });
      }
      if (scene === 4 && t > 0) {
        line(sampled(boundary, .02, .98, t), C['--fg'], 2, .55);
        line(sampled(x => boundary(x) - .045, .02, .98, t), C['--muted'], 1, .35, [4, 5]);
        line(sampled(x => boundary(x) + .045, .02, .98, t), C['--muted'], 1, .35, [4, 5]);
      }
      if (scene === 5 && extra.path) {
        for (let j = 1; j <= 7; j++) { // contour lines
          const ru = .055 * j, rv = ru * Math.sqrt(GD.a / GD.b), ring = [];
          for (let q = 0; q <= 60; q++) ring.push(rotate(Math.cos(q / 60 * 6.283) * ru, Math.sin(q / 60 * 6.283) * rv));
          line(ring, C['--muted'], 1, .22);
        }
        if (t > 0) {
          const k = Math.max(1, Math.round(t * (extra.path.length - 1)));
          const seg = extra.path.slice(0, k + 1);
          line(seg, C['--s2'], 2, .95);
          ctx.fillStyle = C['--s2'];
          seg.forEach((q, i) => {
            const head = i === seg.length - 1;
            ctx.globalAlpha = head ? 1 : .7; ctx.beginPath(); ctx.arc(px(q[0]), py(q[1]), head ? 5 : 2.5, 0, 6.283); ctx.fill();
          });
          ctx.globalAlpha = 1;
        }
      }
      if (scene === 6 && nnEdges.length) {
        ctx.strokeStyle = C['--muted']; ctx.lineWidth = 1; ctx.globalAlpha = .18 * Math.min(1, t * 2);
        ctx.beginPath();
        nnEdges.forEach(e => { ctx.moveTo(px(pts[e[0]].x), py(pts[e[0]].y)); ctx.lineTo(px(pts[e[1]].x), py(pts[e[1]].y)); });
        const g = extra.grid; // image -> first layer
        extra.firstLayer.forEach(a => { ctx.moveTo(px(g[0]) + 8, py((g[1] + g[2]) / 2)); ctx.lineTo(px(pts[a].x), py(pts[a].y)); });
        ctx.stroke(); ctx.globalAlpha = 1;
        if (t >= 1 && !reduced.matches) { // signals travelling forward through the network
          ctx.fillStyle = C['--s2'];
          for (let j = 0; j < 9; j++) {
            const ph = time / 900 + j * .53, e = nnEdges[(Math.floor(ph) * 17 + j * 29) % nnEdges.length], f = ph % 1;
            const A = pts[e[0]], B = pts[e[1]];
            ctx.globalAlpha = .85; ctx.beginPath(); ctx.arc(px(A.x + (B.x - A.x) * f), py(A.y + (B.y - A.y) * f), 2.6, 0, 6.283); ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }
    }

    function draw(time) {
      ctx.clearRect(0, 0, w, h);
      grid();
      overlay(time);
      const jit = reduced.matches ? 0 : 1.2; // gentle breathing jitter, in px
      const groups = new Map();
      pts.forEach(p => {
        const big = scene === 6 && p.role !== 'pt';
        const key = colorOf(p) + '|' + Math.round(p.alpha * 10);
        let g = groups.get(key); if (!g) groups.set(key, (g = []));
        g.push(px(p.x) + (big ? 0 : Math.cos(time / 900 + p.ph) * jit), py(p.y) + (big ? 0 : Math.sin(time / 1100 + p.ph) * jit), big ? 7 : p.r);
      });
      groups.forEach((g, key) => {
        const [color, a] = key.split('|');
        ctx.fillStyle = color; ctx.globalAlpha = a / 10; ctx.beginPath();
        for (let i = 0; i < g.length; i += 3) { ctx.moveTo(g[i] + g[i + 2], g[i + 1]); ctx.arc(g[i], g[i + 1], g[i + 2], 0, 6.283); }
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      // caption, bottom-right
      const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
      ctx.font = '500 12px "IBM Plex Mono", ui-monospace, monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = C['--muted']; ctx.globalAlpha = .9;
      const cap = CAPTIONS[lang][scene].replace('{n}', pts.length);
      ctx.fillText(scene ? `${scene}/${SCENES - 1} · ${cap}` : cap, w - 20, h - 18);
      ctx.globalAlpha = 1;
    }

    function tick(time) {
      if (last && time - last < 30) { raf = requestAnimationFrame(tick); return; }
      const dt = Math.min(66, time - (last || time)); last = time;
      sceneT += dt;
      if (sceneT > (scene ? HOLD : BASE_HOLD)) { sceneT = 0; seq = (seq + 1) % ORDER.length; scene = ORDER[seq]; prog = 0; targets(scene); }
      const k = 1 - Math.pow(1 - .022, dt / 16.7);
      pts.forEach(p => { p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; });
      if (sceneT > 1800) prog = Math.min(1, prog + dt / 1800);
      draw(time);
      raf = requestAnimationFrame(tick);
    }
    let booted = false;
    const start = () => { if (booted && !raf && !document.hidden && !reduced.matches) { last = 0; raf = requestAnimationFrame(tick); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const settle = s => { scene = s; targets(s); pts.forEach(p => { p.x = p.tx; p.y = p.ty; }); prog = 1; };
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    reduced.addEventListener('change', () => { if (!booted) return; stop(); if (reduced.matches) settle(6); draw(0); start(); });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!booted) return; readColors(); buildGrid(); draw(last || 0); });
    new MutationObserver(() => booted && draw(last || 0)).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    let rt; addEventListener('resize', () => { if (!booted) return; clearTimeout(rt); rt = setTimeout(resize, 150); });
    const boot = () => {
      readColors();
      if (reduced.matches) scene = 6; // static frame: the neural-network view
      booted = true; resize(); canvas.classList.add('is-on'); start();
      if (document.fonts) document.fonts.ready.then(() => draw(last || 0));
    };
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(boot, { timeout: 1200 }) : setTimeout(boot, 200));
    if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
  }
})();
