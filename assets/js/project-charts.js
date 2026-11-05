/* Small HTML charts for the project pages.
   <figure class="viz" data-chart='{...}'> with:
     type:   "bar" (zero baseline) | "dot" (mean with an interval, free domain)
     domain: [min, max] of the value axis; ticks: values for gridlines
     fmt:    decimals; pct: true appends " %"
     groups: { key: { es, en, color } }   (legend shown when there are 2+)
     rows:   [{ l: "label" | {es,en}, g: groupKey, v, lo?, hi?, gap? }]   gap: space before the row */
(() => {
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const lang = () => (window.site ? window.site.lang : document.documentElement.lang) === 'en' ? 'en' : 'es';
  const tr = x => (x && typeof x === 'object' ? x[lang()] : x);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T = {
    es: { show: 'Ver tabla de datos', model: 'Configuración', value: 'Valor', range: 'Intervalo' },
    en: { show: 'Show data table', model: 'Configuration', value: 'Value', range: 'Interval' },
  };

  function render(fig) {
    const c = JSON.parse(fig.dataset.chart), L = lang(), t = T[L];
    const [d0, d1] = c.domain, pos = v => ((v - d0) / (d1 - d0)) * 100;
    const fmt = v => v.toLocaleString(L === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: c.fmt ?? 2, maximumFractionDigits: c.fmt ?? 2 }) + (c.pct ? ' %' : '');
    const tick = v => v.toLocaleString(L === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: c.fmt ?? 2 });
    const groups = c.groups || {};
    const keys = Object.keys(groups);

    let html = '';
    if (keys.length > 1) html += `<ul class="legend" aria-hidden="true">${keys.map(k => `<li><i style="background:${groups[k].color}"></i>${esc(tr(groups[k]))}</li>`).join('')}</ul>`;
    html += '<div class="hbars" role="list">';
    c.rows.forEach(r => {
      const color = (groups[r.g] || {}).color || 'var(--s1)';
      const lbl = tr(r.l), grp = groups[r.g] ? tr(groups[r.g]) : '';
      const interval = r.lo != null ? ` (${fmt(r.lo)} – ${fmt(r.hi)})` : '';
      const aria = `${lbl}${grp ? ', ' + grp : ''}: ${fmt(r.v)}${interval}`;
      let mark;
      if (c.type === 'dot') {
        mark = (r.lo != null ? `<span class="bars__err" style="left:${pos(r.lo)}%;width:${pos(r.hi) - pos(r.lo)}%"></span>` : '') +
               `<span class="bars__dot" style="left:${pos(r.v)}%;background:${color}"></span>`;
      } else {
        mark = `<span class="bars__bar" style="width:${pos(r.v)}%;background:${color}"></span>`;
      }
      html += `<div class="bars__row${r.gap ? ' is-gap' : ''}${r.hi_ ? ' is-hi' : ''}" role="listitem" tabindex="0" aria-label="${esc(aria)}">` +
        `<span class="bars__lbl">${esc(lbl)}</span>` +
        `<span class="bars__track" aria-hidden="true">${mark}</span>` +
        `<span class="bars__val num" aria-hidden="true">${fmt(r.v)}</span></div>`;
    });
    // axis
    html += `<div class="bars__row bars__axis" aria-hidden="true"><span></span><span class="bars__track">${(c.ticks || []).map(v => `<span class="bars__tick" style="left:${pos(v)}%">${tick(v)}</span>`).join('')}</span><span></span></div>`;
    html += '</div>';
    // data table (identity is never colour-only, and screen readers get the numbers)
    const hasRange = c.rows.some(r => r.lo != null);
    html += `<details class="viz__table"><summary>${t.show}</summary><table><thead><tr><th>${t.model}</th>${keys.length > 1 ? '<th></th>' : ''}<th>${t.value}</th>${hasRange ? `<th>${t.range}</th>` : ''}</tr></thead><tbody>` +
      c.rows.map(r => `<tr><td>${esc(tr(r.l))}</td>${keys.length > 1 ? `<td>${esc(tr(groups[r.g]))}</td>` : ''}<td>${fmt(r.v)}</td>${hasRange ? `<td>${r.lo != null ? fmt(r.lo) + ' – ' + fmt(r.hi) : ''}</td>` : ''}</tr>`).join('') +
      '</tbody></table></details>';

    let host = fig.querySelector('.viz__body');
    if (!host) { host = document.createElement('div'); host.className = 'viz__body'; fig.appendChild(host); }
    host.innerHTML = html;
    // gridlines behind every track
    $$('.bars__track', host).forEach(tk => tk.style.setProperty('--grid-bg', (c.ticks || []).map(v => `linear-gradient(var(--grid), var(--grid)) ${pos(v)}% 0 / 1px 100% no-repeat`).join(',') || 'none'));
  }

  // static numbers in matrices and tables: <b data-num="89.64" data-dec="2" data-suf=" %">
  const nums = () => $$('[data-num]').forEach(el => {
    const d = +el.dataset.dec;
    el.textContent = (+el.dataset.num).toLocaleString(lang() === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + (el.dataset.suf || '');
  });
  const all = () => { $$('[data-chart]').forEach(render); nums(); };
  all();
  document.addEventListener('langchange', all);
})();
