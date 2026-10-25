/* Colour-dot song sheet, like the song book: one coloured dot per note, note name and lyrics below. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el } = ZP.util;

  function Sheet(song, opts) {
    opts = opts || {};
    const c = ZP.songs.compile(song);
    const style = ZP.store.setting('labels');
    const lang = ZP.store.setting('lang');
    const cells = [];
    const root = el('div.sheet' + (opts.print ? '.print' : ''));
    c.lines.forEach(line => {
      const row = el('div.sheet-line');
      for (let i = line.start; i < line.end; i++) {
        const n = c.notes[i];
        const k = ZP.notes.BY_ID[n.key];
        const len = Math.max(1, Math.min(4, n.dur));
        const cell = el('button.note-cell' + (k.black ? '.is-black' : ''), {
          type: 'button',
          'data-i': i,
          style: { '--len': len },
          onclick: () => opts.onPick && opts.onPick(i)
        },
        el('span.note-dotwrap', ZP.dot(n.key), n.dur >= 2 ? el('span.note-tail', { style: { '--c': k.color } }) : null),
        el('span.note-name', style === 'none' ? '' : ZP.notes.label(n.key, style, lang)),
        el('span.note-lyric' + (n.cont ? '.cont' : ''), n.cont ? '‿' : n.lyric));
        cells.push(cell);
        row.appendChild(cell);
      }
      root.appendChild(row);
    });

    let cur = -1;
    function setCurrent(i, scroll) {
      if (cells[cur]) cells[cur].classList.remove('current');
      cur = i;
      if (cells[i]) {
        cells[i].classList.add('current');
        if (scroll !== false && opts.scroller) {
          // scroll whichever box actually scrolls (the sheet itself, or the page area around it)
          let box = opts.scroller;
          if (box.scrollHeight <= box.clientHeight + 2) box = box.closest('.view-scroll') || box;
          const r = cells[i].getBoundingClientRect();
          const b = box.getBoundingClientRect();
          if (r.top < b.top + 10 || r.bottom > b.bottom - 10) {
            box.scrollTo({ top: box.scrollTop + (r.top - b.top) - b.height / 3, behavior: ZP.fx.reduced ? 'auto' : 'smooth' });
          }
        }
      }
    }
    function mark(i, cls) { if (cells[i]) cells[i].classList.add(cls); }
    function reset() { cells.forEach(cl => cl.classList.remove('done', 'miss', 'current', 'good', 'perfect')); cur = -1; }

    return { el: root, setCurrent, mark, reset, cells };
  }

  ZP.Sheet = Sheet;
})(window.ZP);
