/* On-screen copy of the 18-key toy piano, including the dotted brown fallboard. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el } = ZP.util;

  function Piano(opts) {
    opts = Object.assign({ interactive: true, board: true, compact: false }, opts || {});
    const N = ZP.notes;
    const W = 100 / N.WHITE_COUNT;
    const keyEls = {};
    const dotEls = {};

    // fallboard: dots in chromatic order, grouped 5 · 7 · 5 · 1 exactly like the real piano
    let board = null;
    if (opts.board) {
      const dots = el('div.board-dots');
      N.KEYS.forEach((k, i) => {
        if (i > 0 && (k.name === 'F' || k.name === 'C')) dots.appendChild(el('span.board-gap'));
        const d = el('span.pdot' + (k.light ? '.light' : '') + (k.glitter ? '.glitter' : ''), { style: { '--c': k.color }, title: k.id });
        dotEls[k.id] = d;
        dots.appendChild(d);
      });
      board = el('div.piano-board', dots);
    }

    const keys = el('div.piano-keys');
    N.KEYS.forEach(k => {
      const left = k.black ? (k.whiteIndex + 1) * W - W * 0.29 : k.whiteIndex * W;
      const width = k.black ? W * 0.58 : W;
      const b = el('button.pkey.' + (k.black ? 'black' : 'white'), {
        type: 'button',
        'data-key': k.id,
        'aria-label': k.id + ' ' + k.colorName.en,
        tabindex: opts.interactive ? '0' : '-1',
        style: { left: left + '%', width: width + '%', '--c': k.color }
      },
      el('span.kdot' + (k.light ? '.light' : '') + (k.glitter ? '.glitter' : '')),
      el('span.klabel'),
      el('span.kkbd', k.kbd.toUpperCase()));
      keyEls[k.id] = b;
      keys.appendChild(b);
    });

    const root = el('div.piano' + (opts.compact ? '.compact' : '') + (opts.interactive ? '' : '.passive'), board, keys);

    function setLabels() {
      const style = ZP.store.setting('labels');
      const lang = ZP.store.setting('lang');
      N.KEYS.forEach(k => {
        keyEls[k.id].querySelector('.klabel').textContent = N.label(k.id, style === 'colors' ? 'letters' : style, lang);
      });
      root.classList.toggle('no-labels', style === 'none');
      root.classList.toggle('show-kbd', !!ZP.store.setting('showKbd'));
    }
    setLabels();

    // ── pointer input: multi-touch, press-and-hold, and sliding across keys ──
    const fingers = new Map(); // pointerId -> key id
    function down(id, pid) {
      fingers.set(pid, id);
      keyEls[id].classList.add('held');
      ZP.input.noteOn(id, 'screen', pid);
    }
    function lift(pid) {
      const id = fingers.get(pid);
      if (!id) return;
      fingers.delete(pid);
      if (![...fingers.values()].includes(id)) keyEls[id].classList.remove('held');
      ZP.input.release('screen', pid);
    }
    if (opts.interactive) {
      keys.addEventListener('pointerdown', e => {
        const b = e.target.closest('.pkey');
        if (!b) return;
        e.preventDefault();
        // let the finger slide onto neighbouring keys (touch pointers are captured by default)
        if (b.hasPointerCapture && b.hasPointerCapture(e.pointerId)) b.releasePointerCapture(e.pointerId);
        down(b.dataset.key, e.pointerId);
      });
      keys.addEventListener('pointerover', e => {
        const b = e.target.closest('.pkey');
        if (!b || !fingers.has(e.pointerId) || fingers.get(e.pointerId) === b.dataset.key) return;
        lift(e.pointerId);
        down(b.dataset.key, e.pointerId);
      });
      keys.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('pkey')) {
          e.preventDefault();
          e.stopPropagation();
          if (!e.repeat) ZP.input.emit(e.target.dataset.key, 'screen');
        }
      });
      keys.addEventListener('contextmenu', e => e.preventDefault());
    }
    const up = e => lift(e.pointerId);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);

    const timers = {};
    function flash(id, cls, ms) {
      cls = cls || 'down';
      const k = keyEls[id];
      if (!k) return;
      const tkey = id + cls;
      k.classList.remove(cls);
      void k.offsetWidth; // restart animation
      k.classList.add(cls);
      if (dotEls[id]) dotEls[id].classList.add('lit');
      clearTimeout(timers[tkey]);
      timers[tkey] = setTimeout(() => {
        k.classList.remove(cls);
        if (dotEls[id]) dotEls[id].classList.remove('lit');
      }, ms || 260);
    }

    function highlight(ids, cls) {
      cls = cls || 'target';
      clear(cls);
      (Array.isArray(ids) ? ids : [ids]).forEach(id => {
        if (keyEls[id]) keyEls[id].classList.add(cls);
        if (dotEls[id] && cls !== 'dim') dotEls[id].classList.add(cls);
      });
    }
    function clear(cls) {
      cls = cls || 'target';
      Object.values(keyEls).forEach(k => k.classList.remove(cls));
      Object.values(dotEls).forEach(d => d.classList.remove(cls));
    }

    const offNote = ZP.bus.on('note', n => flash(n.key, n.source === 'mic' ? 'heard' : 'down'));
    const offSet = ZP.bus.on('settings', s => { if (s.key === 'labels' || s.key === 'lang' || s.key === 'showKbd') setLabels(); });

    return {
      el: root,
      keyEl: id => keyEls[id],
      flash, highlight, clear,
      // horizontal centre/width of a key relative to the keys area (0..1)
      geometry(id) {
        const k = N.BY_ID[id];
        if (!k) return null;
        const left = k.black ? (k.whiteIndex + 1) * W - W * 0.29 : k.whiteIndex * W;
        const width = k.black ? W * 0.58 : W;
        return { left: left / 100, width: width / 100, black: k.black };
      },
      destroy() {
        offNote(); offSet();
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        [...fingers.keys()].forEach(lift);
        Object.values(timers).forEach(clearTimeout);
        root.remove();
      }
    };
  }

  // Small inline dot (used in sheets, games, lists)
  function dot(id, extra) {
    const k = ZP.notes.BY_ID[id];
    if (!k) return el('span.ndot');
    return el('span.ndot' + (k.light ? '.light' : '') + (k.glitter ? '.glitter' : '') + (extra ? '.' + extra : ''), { style: { '--c': k.color }, title: k.id });
  }

  ZP.Piano = Piano;
  ZP.dot = dot;
})(window.ZP);
