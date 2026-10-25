/* Free play with sound choice, a recorder, and the song maker for "My Songs". */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el, clear } = ZP.util;
  const t = (k, v) => ZP.i18n.t(k, v);

  ZP.views.free = function (root, route, S) {
    root.appendChild(ZP.ui.head('🎹 ' + t('nav.free')));

    // sound picker
    const sounds = el('div.seg.sounds');
    ['toy', 'musicbox', 'piano', 'xylo', 'chip'].forEach(p => {
      sounds.appendChild(el('button.seg-btn' + (ZP.store.setting('sound') === p ? '.on' : ''), {
        onclick: e => {
          ZP.store.setting('sound', p);
          sounds.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('on'));
          e.currentTarget.classList.add('on');
          ZP.audio.play('C5');
        }
      }, t('sound.' + p)));
    });

    // recorder
    let rec = null, recording = false, recStart = 0, playback = null;
    const recBtn = el('button.btn', { onclick: toggleRec }, '⏺ ' + t('free.record'));
    const playBtn = el('button.btn', { onclick: playRec, disabled: true }, '▶ ' + t('free.playback'));
    const saveBtn = el('button.btn', { onclick: () => saveDialog(recToText()), disabled: true }, '💾 ' + t('free.save'));
    const trail = el('div.trail.free-trail');
    const piano = ZP.Piano();

    root.appendChild(el('div.card.free-top',
      el('div.free-row', el('b', '🔊 ' + t('free.sound')), sounds),
      el('div.free-row', el('b', '🎙️ ' + t('free.recorder')), recBtn, playBtn, saveBtn),
      trail));
    root.appendChild(el('div.piano-dock.big', piano.el));
    root.appendChild(el('p.muted.center', t('free.kbdTip')));

    function toggleRec() {
      if (recording) {
        recording = false;
        recBtn.textContent = '⏺ ' + t('free.record');
        recBtn.classList.remove('rec');
        playBtn.disabled = saveBtn.disabled = !rec.length;
        return;
      }
      rec = [];
      recording = true;
      recStart = 0;
      recBtn.textContent = '⏹ ' + t('stop');
      recBtn.classList.add('rec');
      clear(trail);
    }
    function playRec() {
      if (!rec || !rec.length) return;
      if (playback) playback.stop();
      const notes = rec.map(r => ({ key: r.key, start: r.t, dur: 0.5 }));
      playback = ZP.audio.sequence(notes, 60, { onNote: n => piano.flash(n.key, 'demo', 300) });
      S.add(() => playback && playback.stop());
    }
    // Quantise the recording to half beats at 100 bpm for the song maker.
    function recToText() {
      if (!rec || !rec.length) return '';
      const spb = 0.6;
      const out = rec.map((r, i) => {
        const nextT = rec[i + 1] ? rec[i + 1].t : r.t + spb * 2;
        let d = Math.round(((nextT - r.t) / spb) * 2) / 2;
        d = Math.min(4, Math.max(0.5, d));
        return r.key + (d === 1 ? '' : ':' + d);
      });
      const lines = [];
      for (let i = 0; i < out.length; i += 8) lines.push(out.slice(i, i + 8).join(' '));
      return lines.join('\n');
    }

    S.on('note', nt => {
      trail.appendChild(ZP.dot(nt.key));
      while (trail.childNodes.length > 24) trail.removeChild(trail.firstChild);
      if (recording) {
        const now = ZP.audio.now();
        if (!recStart) recStart = now;
        rec.push({ key: nt.key, t: now - recStart });
      }
    });

    function saveDialog(text) {
      const name = el('input.inp', { type: 'text', placeholder: t('maker.namePh'), maxlength: '40' });
      const area = el('textarea.inp.notes-inp', { rows: '5', placeholder: 'C D E C | E F G:2' });
      area.value = text || '';
      const bpm = el('input.inp', { type: 'number', min: '40', max: '200', value: '100' });
      const err = el('p.err');
      const preview = el('div.seq-row');
      const updatePreview = () => {
        clear(preview); err.textContent = '';
        try {
          const s = ZP.songs.fromText('x', area.value, 100);
          ZP.songs.compile(s).notes.slice(0, 40).forEach(n => preview.appendChild(ZP.dot(n.key, 'sm')));
        } catch (e) { if (area.value.trim()) err.textContent = t('maker.error', { tok: e.message }); }
      };
      area.addEventListener('input', updatePreview);
      updatePreview();
      const m = ZP.fx.modal([
        el('h2', '✍️ ' + t('maker.title')),
        el('p.muted', t('maker.help')),
        el('label.field', t('maker.name'), name),
        el('label.field', t('maker.notes'), area),
        preview, err,
        el('label.field', 'BPM', bpm),
        el('div.btn-row',
          el('button.btn', { onclick: () => {
            try {
              const s = ZP.songs.fromText('x', area.value, 100);
              ZP.audio.sequence(ZP.songs.compile(s).notes, +bpm.value || 100, { onNote: n => piano.flash(n.key, 'demo', 300) });
            } catch (e) { err.textContent = t('maker.error', { tok: e.message }); }
          } }, '▶ ' + t('play')),
          el('button.btn.primary', { onclick: () => {
            try {
              const s = ZP.songs.fromText(name.value.trim() || t('maker.untitled'), area.value, Math.max(40, Math.min(200, +bpm.value || 100)));
              s.id = 'my-' + Date.now().toString(36);
              ZP.store.state.custom.push(s);
              ZP.store.save();
              ZP.store.award('composer');
              ZP.store.addXP(25, 'composer');
              m.close();
              location.hash = '#/song/' + s.id + '?mode=learn';
            } catch (e) { err.textContent = t('maker.error', { tok: e.message }); }
          } }, '💾 ' + t('free.save')),
          el('button.btn.ghost', { onclick: () => m.close() }, t('cancel')))
      ]);
    }

    root.appendChild(el('div.btn-row.center', el('button.btn.primary', { onclick: () => saveDialog('') }, '✍️ ' + t('maker.title'))));
    if (route.params.maker) setTimeout(() => saveDialog(''), 50);
  };
})(window.ZP);
