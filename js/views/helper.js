/* Real Piano Helper: listens to the real toy piano, shows which key was played,
   guesses the song you are playing, and calibrates the microphone to your piano. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el, clear } = ZP.util;
  const t = (k, v) => ZP.i18n.t(k, v);
  const tx = o => ZP.i18n.tx(o);

  // Finds the song whose melody best contains the recently played notes (works in any key).
  function guessSong(history) {
    if (history.length < 4) return null;
    const seq = history.slice(-10).map(id => ZP.notes.BY_ID[id].midi);
    const iv = seq.slice(1).map((m, i) => m - seq[i]);
    let best = null;
    ZP.songs.SONGS.forEach(song => {
      const mel = ZP.songs.compile(song).notes.map(n => ZP.notes.BY_ID[n.key].midi);
      const miv = mel.slice(1).map((m, i) => m - mel[i]);
      // longest run of intervals ending at the latest note
      for (let s = 0; s < miv.length; s++) {
        let len = 0;
        while (len < iv.length && s - len >= 0 && miv[s - len] === iv[iv.length - 1 - len]) len++;
        if (len >= 3 && (!best || len > best.len)) best = { song, len };
      }
    });
    return best;
  }

  ZP.views.helper = function (root, route, S) {
    const lang = ZP.store.setting('lang');
    root.appendChild(ZP.ui.head('🎤 ' + t('helper.title')));
    root.appendChild(ZP.fx.bubble('happy', t('helper.intro')));

    const big = el('div.heard-big', el('span.heard-dot'), el('div.heard-text', el('b', t('helper.waiting')), el('small', '')));
    const needle = el('div.tuner', el('span.tuner-mid'), el('span.tuner-needle'));
    const level = el('div.level-meter', el('span'));
    const trail = el('div.trail');
    const guess = el('div.guess');
    const startBtn = el('button.btn.primary.big', { onclick: toggle }, '🎤 ' + t('helper.start'));
    const piano = ZP.Piano();

    const sens = el('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(ZP.store.setting('sensitivity')), 'aria-label': t('helper.sensitivity') });
    sens.addEventListener('input', () => ZP.store.setting('sensitivity', parseFloat(sens.value)));

    const calInfo = el('p.muted');
    function showCal() {
      const cal = ZP.store.state.calibration;
      calInfo.textContent = cal.keys ? t('cal.statusFull') : cal.offset ? t('cal.statusQuick', { n: (cal.offset > 0 ? '+' : '') + cal.offset.toFixed(1) }) : t('cal.statusNone');
    }
    showCal();

    root.appendChild(el('div.helper-grid',
      el('div.card.helper-main', startBtn, big, needle, level,
        el('label.slider-row', t('helper.sensitivity'), sens),
        el('p.muted.small', t('helper.tips'))),
      el('div.card.helper-side',
        el('h3', '🎼 ' + t('helper.trail')), trail,
        el('h3', '🔮 ' + t('helper.guess')), guess,
        el('h3', '🔧 ' + t('cal.title')), calInfo,
        el('div.btn-row',
          el('button.btn', { onclick: () => calibrate(false) }, '⚡ ' + t('cal.quick')),
          el('button.btn', { onclick: () => calibrate(true) }, '🎯 ' + t('cal.full')),
          el('button.btn.ghost', { onclick: () => { ZP.store.state.calibration = { offset: 0, keys: null }; ZP.store.save(); showCal(); } }, t('cal.reset'))))));
    root.appendChild(el('div.piano-dock', piano.el));
    guess.appendChild(el('p.muted', t('helper.guessHint')));

    const history = [];
    let on = false;

    async function toggle() {
      if (on) { ZP.pitch.stop(); on = false; startBtn.textContent = '🎤 ' + t('helper.start'); startBtn.classList.remove('on'); return; }
      try {
        await ZP.pitch.start();
        on = true;
        startBtn.textContent = '⏹ ' + t('helper.stop');
        startBtn.classList.add('on');
      } catch (e) {
        ZP.fx.toast(ZP.pitch.supported() ? t('mic.denied') : t('mic.unsupported'), 'warn');
      }
    }
    S.add(() => ZP.pitch.stop());

    S.on('pitch', p => {
      level.firstChild.style.width = Math.min(100, p.rms * 900) + '%';
      if (!p.key) return;
      const cents = Math.max(-50, Math.min(50, p.cents));
      needle.querySelector('.tuner-needle').style.left = (50 + cents) + '%';
    });

    S.on('note', nt => {
      const k = ZP.notes.BY_ID[nt.key];
      const style = ZP.store.setting('labels');
      const d = big.querySelector('.heard-dot');
      d.style.setProperty('--c', k.color);
      d.className = 'heard-dot pop' + (k.light ? ' light' : '') + (k.glitter ? ' glitter' : '');
      void d.offsetWidth;
      big.querySelector('b').textContent = k.colorName[lang] + ' · ' + ZP.notes.label(nt.key, style === 'none' ? 'letters' : style, lang);
      big.querySelector('small').textContent = nt.source === 'mic' ? t('helper.heard') : t('helper.pressed');
      history.push(nt.key);
      if (history.length > 40) history.shift();
      clear(trail);
      history.slice(-16).forEach(id => trail.appendChild(ZP.dot(id)));
      const g = guessSong(history);
      clear(guess);
      if (g) {
        guess.appendChild(el('a.song-card.guess-card', { href: '#/song/' + g.song.id + '?mode=learn' },
          el('span.song-emoji', g.song.emoji),
          el('span.song-info', el('small', t('helper.isIt')), el('b', tx(g.song.title))),
          el('span.btn.small', t('play') + ' ▶')));
      } else {
        guess.appendChild(el('p.muted', t('helper.guessHint')));
      }
    });

    // ── calibration wizard ──
    async function calibrate(full) {
      if (!ZP.pitch.supported()) { ZP.fx.toast(t('mic.unsupported'), 'warn'); return; }
      try { await ZP.pitch.start(); on = true; startBtn.textContent = '⏹ ' + t('helper.stop'); startBtn.classList.add('on'); }
      catch (e) { ZP.fx.toast(t('mic.denied'), 'warn'); return; }
      const keys = full ? ZP.notes.KEYS.map(k => k.id) : ['C4'];
      const found = {};
      let cancelled = false;
      ZP.input.blocked = true;
      const body = el('div.cal-body');
      const m = ZP.fx.modal([el('h2', '🔧 ' + t('cal.title')), body,
        el('button.btn.ghost', { onclick: () => { cancelled = true; m.close(); } }, t('cancel'))],
      { sticky: true, onClose: () => { cancelled = true; ZP.input.blocked = false; } });
      for (let i = 0; i < keys.length && !cancelled; i++) {
        const id = keys[i];
        const k = ZP.notes.BY_ID[id];
        clear(body).append(
          el('p', t('cal.press', { c: k.colorName[lang], n: ZP.notes.label(id, 'letters') })),
          el('div.cal-dot', ZP.dot(id, 'xl')),
          el('p.muted', (i + 1) + ' / ' + keys.length),
          el('div.progress', el('span', { style: { width: (i / keys.length * 100) + '%' } })));
        piano.highlight(id, 'target');
        try {
          found[id] = await ZP.pitch.capture(20000);
          ZP.audio.jingle('good');
          await ZP.util.wait(700); // let the rod ring out before the next key
        } catch (e) {
          if (cancelled) break;
          clear(body).append(el('p', t('cal.timeout')));
          await ZP.util.wait(1500);
          i--; // try the same key again
        }
      }
      piano.clear('target');
      ZP.input.blocked = false;
      if (cancelled) return;
      const cal = ZP.store.state.calibration;
      if (full) {
        cal.keys = found;
        cal.offset = 0;
      } else {
        cal.keys = null;
        cal.offset = ZP.notes.freqToMidi(found.C4) - 60;
      }
      ZP.store.save();
      ZP.store.award('tuned');
      ZP.store.addXP(20, 'calibrate');
      showCal();
      clear(body).append(el('p.big', '✅ ' + t('cal.done')));
      setTimeout(() => m.close(), 1400);
    }
  };

  ZP.helper = { guessSong };
})(window.ZP);
