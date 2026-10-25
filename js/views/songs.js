/* Song library with worlds, and the song player (Listen · Learn · Rhythm). */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el, clear } = ZP.util;
  const t = (k, v) => ZP.i18n.t(k, v);
  const tx = o => ZP.i18n.tx(o);

  function songCard(song, locked) {
    const c = ZP.songs.compile(song);
    const stars = ZP.store.songStars(song.id);
    const diff = ZP.ui.difficulty(song);
    return el(locked ? 'span' : 'a', {
      class: 'song-card' + (locked ? ' locked' : '') + (stars ? ' played' : ''),
      href: locked ? undefined : '#/song/' + song.id
    },
    el('span.song-emoji', locked ? '🔒' : song.emoji),
    el('span.song-info',
      el('b', tx(song.title)),
      el('span.song-meta',
        el('span.diff', { title: t('songs.difficulty') }, '●'.repeat(diff) + '○'.repeat(5 - diff)),
        c.hasBlack ? el('span.tag.dark', t('songs.blackKeys')) : null,
        song.book ? el('span.tag', '📖 ' + t('songs.inBook')) : null),
      el('span.song-dots', c.keysUsed.slice().sort((a, b) => ZP.notes.BY_ID[a].midi - ZP.notes.BY_ID[b].midi).map(k => ZP.dot(k, 'sm')))),
    el('span.song-stars', ZP.util.starsText(stars)));
  }

  ZP.views.songs = function (root) {
    root.appendChild(ZP.ui.head('🎶 ' + t('nav.songs')));
    const total = ZP.store.totalStars();
    root.appendChild(ZP.fx.bubble('happy', t('songs.intro', { n: total })));
    ZP.songs.WORLDS.forEach(w => {
      const open = ZP.store.worldUnlocked(w.id);
      const list = ZP.songs.SONGS.filter(s => s.world === w.id);
      const got = list.reduce((s, x) => s + ZP.store.songStars(x.id), 0);
      root.appendChild(el('section.world' + (open ? '' : '.locked'), { style: { '--wc': w.color } },
        el('div.world-head',
          el('span.world-emoji', w.emoji),
          el('div',
            el('h2', t('songs.world') + ' ' + w.id + ' · ' + tx(w.title)),
            el('p.muted', open ? tx(w.about) : t('songs.need', { n: w.need - total }))),
          el('span.world-stars', '⭐ ' + got + '/' + list.length * 3)),
        el('div.song-grid', list.map(s => songCard(s, !open)))));
    });
    // custom songs
    const mine = ZP.store.state.custom;
    root.appendChild(el('section.world', { style: { '--wc': '#F4C6D0' } },
      el('div.world-head', el('span.world-emoji', '✍️'),
        el('div', el('h2', t('songs.mine')), el('p.muted', t('songs.mineText')))),
      el('div.song-grid',
        mine.map(s => el('div.song-card-wrap', songCard(s, false),
          el('button.icon-btn.del', { title: t('delete'), 'aria-label': t('delete'), onclick: () => {
            if (!confirm(t('confirmDelete'))) return;
            ZP.store.state.custom = mine.filter(x => x.id !== s.id);
            ZP.store.save();
            ZP.app.render();
          } }, '🗑️'))),
        el('a.song-card.add', { href: '#/free?maker=1' }, el('span.song-emoji', '➕'), el('span.song-info', el('b', t('songs.create')))))));
  };

  // ───────────────────────── player ─────────────────────────
  ZP.views.song = function (root, route, S) {
    const song = ZP.ui.findSong(route.args[0]);
    if (!song) { location.hash = '#/songs'; return; }
    if (song.world && !ZP.store.worldUnlocked(song.world)) { location.hash = '#/songs'; return; }
    const c = ZP.songs.compile(song);
    const N = c.notes.length;
    let mode = route.params.mode || (ZP.store.songStars(song.id) ? 'play' : 'learn');
    if (!['listen', 'learn', 'play'].includes(mode)) mode = 'learn';
    let tempo = mode === 'play' ? 0.75 : 1;
    let micOn = false;
    let run = null; // current mode controller

    // ── layout ──
    const starEl = el('span.head-stars', ZP.util.starsText(ZP.store.songStars(song.id)));
    root.appendChild(ZP.ui.head(song.emoji + ' ' + tx(song.title), '#/songs', starEl));
    if (song.note) root.appendChild(el('p.muted.song-note', 'ℹ️ ' + tx(song.note)));

    const modes = el('div.seg', { role: 'tablist' });
    [['listen', '👂'], ['learn', '🐢'], ['play', '🎮']].forEach(([m, ico]) => {
      modes.appendChild(el('button.seg-btn' + (m === mode ? '.on' : ''), { role: 'tab', 'data-m': m, onclick: () => setMode(m) },
        el('span', ico), el('span.seg-txt', t('mode.' + m))));
    });
    const tempoLabel = el('span.tempo-val');
    const tempoInput = el('input', { type: 'range', min: '40', max: '130', step: '5', value: String(tempo * 100), 'aria-label': t('tempo') });
    tempoInput.addEventListener('input', () => { tempo = tempoInput.value / 100; tempoLabel.textContent = Math.round(tempo * 100) + '%'; if (run && run.onTempo) run.onTempo(); });
    tempoLabel.textContent = Math.round(tempo * 100) + '%';
    const micBtn = el('button.chip-btn', { onclick: toggleMic, title: t('mic.helpShort') }, '🎤 ' + t('mic.realPiano'));
    const printBtn = el('button.chip-btn', { onclick: printSheet, title: t('print') }, '🖨️');
    const toolbar = el('div.player-bar', modes,
      el('label.tempo', '🐢', tempoInput, '🐇', tempoLabel),
      micBtn, printBtn);
    root.appendChild(toolbar);

    const desc = el('div.mode-desc');
    const stage = el('div.stage');
    const status = el('div.status-bar');
    const controls = el('div.controls');
    const piano = ZP.Piano();
    root.appendChild(desc);
    root.appendChild(stage);
    root.appendChild(el('div.status-row', status, controls));
    const dock = el('div.piano-dock', piano.el);
    root.appendChild(dock);

    function setMode(m) {
      if (run) run.stop();
      mode = m;
      modes.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('on', b.dataset.m === m));
      history.replaceState(null, '', '#/song/' + song.id + '?mode=' + m);
      if (m === 'play' && tempo > 0.85 && !ZP.store.state.songs[song.id]) { tempo = 0.75; tempoInput.value = 75; tempoLabel.textContent = '75%'; }
      piano.clear('target'); piano.clear('demo');
      clear(stage); clear(status); clear(controls);
      desc.textContent = t('mode.' + m + '.desc');
      run = ({ listen: Listen, learn: Learn, play: Rhythm })[m]();
    }

    async function toggleMic() {
      if (micOn) {
        ZP.pitch.stop();
        micOn = false;
      } else {
        try {
          await ZP.pitch.start();
          micOn = true;
          ZP.fx.toast('🎤 ' + t('mic.onToast'));
        } catch (e) {
          ZP.fx.toast(ZP.pitch.supported() ? t('mic.denied') : t('mic.unsupported'), 'warn');
        }
      }
      micBtn.classList.toggle('on', micOn);
      if (run && run.onMic) run.onMic();
    }
    S.add(() => { if (micOn) ZP.pitch.stop(); });
    S.add(() => run && run.stop());

    function makeSheet(onPick) {
      const scroller = el('div.sheet-scroll');
      const sheet = ZP.Sheet(song, { scroller, onPick });
      scroller.appendChild(sheet.el);
      stage.appendChild(scroller);
      return sheet;
    }

    function printSheet() {
      const w = el('div.print-only',
        el('h1', song.emoji + ' ' + tx(song.title)),
        ZP.Sheet(song, { print: true }).el,
        el('p.muted', t('print.footer')));
      document.body.appendChild(w);
      document.body.classList.add('printing');
      window.print();
      setTimeout(() => { w.remove(); document.body.classList.remove('printing'); }, 500);
    }

    function nextInfo(i) {
      const n = c.notes[i];
      if (!n) return el('span');
      const k = ZP.notes.BY_ID[n.key];
      const lang = ZP.store.setting('lang');
      const style = ZP.store.setting('labels');
      return el('span.next-note', el('small', t('next') + ':'), ZP.dot(n.key, 'lg'),
        el('b', k.colorName[lang] + (style !== 'none' ? ' · ' + ZP.notes.label(n.key, style, lang) : '')),
        k.black ? el('span.tag.dark', t('songs.blackKey')) : null);
    }

    function results(kind, stars, lines, again) {
      const gained = ZP.store.recordSong(song.id, kind, stars.stars, stars);
      const xp = Math.round(10 + N * 0.6 + stars.stars * 12 + (gained * 15));
      ZP.store.addXP(xp, 'song');
      starEl.textContent = ZP.util.starsText(ZP.store.songStars(song.id));
      ZP.app.updateHud();
      if (stars.stars >= 2) ZP.fx.confetti(stars.stars === 3 ? 200 : 100);
      ZP.audio.jingle(stars.stars >= 2 ? 'win' : 'great');
      const m = ZP.fx.modal([
        ZP.fx.mascot(stars.stars >= 2 ? 'wow' : 'happy', 100),
        el('h2', t(stars.stars === 3 ? 'res.amazing' : stars.stars === 2 ? 'res.great' : stars.stars === 1 ? 'res.good' : 'res.try')),
        el('div.big-stars', [0, 1, 2].map(i => el('span' + (i < stars.stars ? '.on' : ''), { style: { animationDelay: (0.25 + i * 0.25) + 's' } }, '★'))),
        el('ul.res-lines', lines.map(l => el('li', l))),
        el('p.muted', '+' + xp + ' XP'),
        el('div.btn-row',
          el('button.btn.primary', { onclick: () => { m.close(); again(); } }, '🔁 ' + t('again')),
          mode !== 'play' ? el('button.btn', { onclick: () => { m.close(); setMode('play'); } }, '🎮 ' + t('mode.play')) : null,
          el('a.btn.ghost', { href: '#/songs', onclick: () => m.close() }, t('nav.songs')))
      ], { cls: 'celebrate' });
    }

    // ── Listen: the app plays the song, keys and dots light up ──
    function Listen() {
      const sheet = makeSheet();
      let h = null;
      const btn = el('button.btn.primary.big', { onclick: toggle }, '▶ ' + t('play'));
      controls.appendChild(btn);
      status.appendChild(el('span.muted', t('listen.tip')));
      function toggle() {
        if (h) return stopPlay();
        ZP.input.blocked = true;
        btn.textContent = '⏹ ' + t('stop');
        h = ZP.audio.sequence(c.notes, song.bpm * tempo, {
          onNote: (n, i) => {
            piano.flash(n.key, 'demo', Math.max(200, n.dur * 60000 / (song.bpm * tempo) - 40));
            sheet.setCurrent(i);
          }
        });
        h.done.then(ok => {
          if (ok) { sheet.setCurrent(-1); if (!S._listened) { S._listened = true; ZP.store.addXP(5, 'listen'); } }
          stopPlay(true);
        });
      }
      function stopPlay(natural) {
        if (h && !natural) h.stop();
        h = null;
        ZP.input.blocked = false;
        btn.textContent = '▶ ' + t('play');
      }
      return { stop() { if (h) stopPlay(); } };
    }

    // ── Learn: waits for the right key, at your own pace ──
    function Learn() {
      let i = 0, mistakes = 0, wrongHere = 0, fromStart = true, idleTimer = null;
      const sheet = makeSheet(j => { i = j; fromStart = j === 0; mistakes = 0; update(); });
      const mistakesEl = el('span.pill', '');
      const restart = el('button.btn', { onclick: () => { i = 0; mistakes = 0; fromStart = true; sheet.reset(); update(); } }, '⏮ ' + t('restart'));
      const hintBtn = el('button.btn.ghost', { onclick: () => { const n = c.notes[i]; if (n && !micOn) ZP.audio.play(n.key); piano.flash(n.key, 'demo', 600); } }, '💡 ' + t('hint'));
      controls.append(hintBtn, restart);
      const sc = ZP.util.scope();

      function update() {
        clear(status).append(nextInfo(i), mistakesEl);
        mistakesEl.textContent = '❌ ' + mistakes;
        const n = c.notes[i];
        piano.highlight(n ? [n.key] : [], 'target');
        sheet.setCurrent(i);
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => { if (c.notes[i]) piano.flash(c.notes[i].key, 'nudge', 900); }, 4000);
      }

      sc.on('note', nt => {
        const n = c.notes[i];
        if (!n) return;
        const ok = nt.key === n.key || (nt.source === 'mic' && ZP.notes.BY_ID[nt.key].pc === ZP.notes.BY_ID[n.key].pc);
        if (ok) {
          piano.flash(n.key, 'good');
          sheet.mark(i, 'done');
          i++;
          wrongHere = 0;
          if (i >= N) return done();
          update();
        } else {
          piano.flash(nt.key, 'bad');
          mistakes++;
          wrongHere++;
          mistakesEl.textContent = '❌ ' + mistakes;
          if (wrongHere >= 2) piano.flash(n.key, 'nudge', 900);
          const a = ZP.notes.BY_ID[n.key].midi, b = ZP.notes.BY_ID[nt.key].midi;
          ZP.fx.toast(a > b ? t('hint.right') : t('hint.left'), 'hint');
        }
      });

      function done() {
        clearTimeout(idleTimer);
        piano.clear('target');
        sheet.setCurrent(-1);
        const rate = mistakes / N;
        const stars = fromStart ? (rate <= 0.05 ? 3 : rate <= 0.2 ? 2 : 1) : 0;
        const lines = [t('res.notes', { n: N }), t('res.mistakes', { n: mistakes })];
        if (!fromStart) lines.push(t('res.partial'));
        results('learn', { stars, perfect: fromStart && mistakes === 0 }, lines, () => { i = 0; mistakes = 0; fromStart = true; sheet.reset(); update(); });
      }

      update();
      return { stop() { sc.dispose(); clearTimeout(idleTimer); } };
    }

    // ── Rhythm: notes fall down, play them in time ──
    function Rhythm() {
      const canvas = el('canvas.highway');
      const wrap = el('div.highway-wrap', canvas, el('div.lyric-line'));
      stage.appendChild(wrap);
      const lyricEl = wrap.querySelector('.lyric-line');
      let guide = !micOn, metro = true;
      const guideBtn = el('button.chip-btn' + (guide ? '.on' : ''), { onclick: () => { guide = !guide; guideBtn.classList.toggle('on', guide); } }, '🎵 ' + t('rhythm.guide'));
      const metroBtn = el('button.chip-btn.on', { onclick: () => { metro = !metro; metroBtn.classList.toggle('on', metro); } }, '🥁 ' + t('rhythm.metro'));
      const startBtn = el('button.btn.primary.big', { onclick: () => (playing ? stopRun(false) : startRun()) }, '▶ ' + t('start'));
      controls.append(guideBtn, metroBtn, startBtn);
      const scoreEl = el('span.pill', '0');
      const comboEl = el('span.pill', '');
      status.append(el('span.muted', t('rhythm.tip')), scoreEl, comboEl);

      const sc = ZP.util.scope();
      let playing = false, raf = 0, t0 = 0, spb = 0.6, judged = [], score = 0, combo = 0, maxCombo = 0, counts = { perfect: 0, good: 0, miss: 0 };
      let pops = [], endAt = 0, ch = null, lanes = {};
      const TRAVEL = 2.4; // seconds a note needs to fall
      const dpr = window.devicePixelRatio || 1;

      // lanes follow the real on-screen key positions, so notes land exactly on their key
      function size() {
        const r = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, r.width * dpr);
        canvas.height = Math.max(1, r.height * dpr);
        ZP.notes.KEYS.forEach(k => {
          const kr = piano.keyEl(k.id).getBoundingClientRect();
          lanes[k.id] = r.width ? { left: (kr.left - r.left) / r.width, width: kr.width / r.width } : piano.geometry(k.id);
        });
      }
      size();
      sc.listen(window, 'resize', size);

      function startRun() {
        if (!ZP.audio.ensure()) return;
        size();
        spb = 60 / (song.bpm * tempo);
        const lead = (song.meter === 6 ? 3 : song.meter) * spb; // count-in
        t0 = ZP.audio.now() + Math.max(lead, TRAVEL) + 0.2;
        judged = new Array(N).fill(null);
        score = 0; combo = 0; maxCombo = 0; counts = { perfect: 0, good: 0, miss: 0 }; pops = [];
        endAt = t0 + c.totalBeats * spb + 0.8;
        // metronome & guide melody are scheduled on the audio clock
        const beats = Math.ceil(c.totalBeats) + Math.ceil(lead / spb);
        const meter = song.meter === 6 ? 3 : song.meter;
        ch = ZP.audio.channel();
        for (let b = -Math.ceil(lead / spb); b < beats; b++) {
          const when = t0 + b * spb;
          if (when < ZP.audio.now()) continue;
          if (b < 0 || metro) ZP.audio.click(when, ((b % meter) + meter) % meter === 0, ch);
          if (b >= c.totalBeats) break;
        }
        if (guide) c.notes.forEach(n => ZP.audio.play(n.key, { when: t0 + n.start * spb, dur: n.dur * spb, velocity: 0.35, dest: ch }));
        playing = true;
        startBtn.textContent = '⏹ ' + t('stop');
        piano.clear('target');
        raf = requestAnimationFrame(frame);
      }

      function stopRun(finished) {
        playing = false;
        cancelAnimationFrame(raf);
        startBtn.textContent = '▶ ' + t('start');
        if (!finished && ch) ch.stop(); // silence scheduled clicks and guide notes
        ch = null;
        draw(ZP.audio.now());
        if (finished) {
          const acc = N ? (counts.perfect * 100 + counts.good * 60) / (N * 100) : 0;
          const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : acc >= 0.4 ? 1 : 0;
          results('play', { stars, score, perfect: counts.miss === 0 && counts.good === 0 }, [
            t('res.accuracy', { n: Math.round(acc * 100) }),
            '🎯 ' + t('res.perfect') + ': ' + counts.perfect + ' · 👍 ' + t('res.goodHits') + ': ' + counts.good + ' · 💨 ' + t('res.miss') + ': ' + counts.miss,
            '🔗 ' + t('res.combo') + ': ' + maxCombo
          ], startRun);
        }
      }

      function judge(i, kind, now) {
        judged[i] = kind;
        counts[kind]++;
        if (kind === 'miss') { combo = 0; }
        else {
          combo++;
          maxCombo = Math.max(maxCombo, combo);
          score += (kind === 'perfect' ? 100 : 60) + Math.min(combo, 20) * 5;
        }
        scoreEl.textContent = '⭐ ' + score;
        comboEl.textContent = combo > 2 ? '🔗 ' + combo : '';
        const n = c.notes[i];
        pops.push({ key: n.key, kind, at: now });
      }

      sc.on('note', nt => {
        if (!playing) return;
        const now = nt.time - (nt.source === 'mic' ? ZP.store.setting('micLatency') / 1000 : 0.03);
        const songT = now - t0;
        let best = -1, bestD = 1e9;
        for (let i = 0; i < N; i++) {
          if (judged[i]) continue;
          const n = c.notes[i];
          const d = Math.abs(n.start * spb - songT);
          const same = n.key === nt.key || (nt.source === 'mic' && ZP.notes.BY_ID[n.key].pc === ZP.notes.BY_ID[nt.key].pc);
          if (same && d < bestD) { bestD = d; best = i; }
          if (n.start * spb - songT > 0.5) break;
        }
        if (best >= 0 && bestD <= 0.28) {
          const kind = bestD <= 0.11 ? 'perfect' : 'good';
          judge(best, kind, ZP.audio.now());
          piano.flash(nt.key, 'good');
        } else {
          piano.flash(nt.key, 'bad');
          combo = 0;
          comboEl.textContent = '';
        }
      });

      function frame() {
        if (!playing) return;
        const now = ZP.audio.now();
        const songT = now - t0;
        for (let i = 0; i < N; i++) {
          if (!judged[i] && songT - c.notes[i].start * spb > 0.28) judge(i, 'miss', now);
        }
        // next-key hint on the piano
        const nextIdx = judged.findIndex(j => !j);
        if (nextIdx >= 0) {
          const nn = c.notes[nextIdx];
          const dt = nn.start * spb - songT;
          if (dt < spb * 1.2) piano.highlight(nn.key, 'target'); else piano.clear('target');
          if (nn.lyric || nn.cont) {
            const line = c.lines[nn.line];
            lyricEl.textContent = line.lyrics.replace(/~/g, '');
          }
        } else piano.clear('target');
        draw(now);
        if (now > endAt) return stopRun(true);
        raf = requestAnimationFrame(frame);
      }

      function draw(now) {
        const g = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        g.clearRect(0, 0, W, H);
        const hitY = H - 6 * dpr;
        // lanes
        ZP.notes.KEYS.forEach(k => {
          if (k.black) return;
          const geo = lanes[k.id];
          g.fillStyle = k.whiteIndex % 2 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)';
          g.fillRect(geo.left * W, 0, geo.width * W, H);
        });
        // hit line
        g.fillStyle = 'rgba(196,138,116,0.9)';
        g.fillRect(0, hitY - 2 * dpr, W, 4 * dpr);
        if (!playing && !judged.length) return;
        const songT = now - t0;
        const pxPerSec = hitY / TRAVEL;
        const style = ZP.store.setting('labels');
        const lang = ZP.store.setting('lang');
        for (let i = 0; i < N; i++) {
          const n = c.notes[i];
          const dt = n.start * spb - songT;
          if (dt > TRAVEL + 0.2) break;
          const len = Math.max(n.dur * spb * pxPerSec - 4 * dpr, 16 * dpr);
          const yBottom = hitY - dt * pxPerSec;
          if (yBottom - len > H) continue;
          const geo = lanes[n.key];
          const k = ZP.notes.BY_ID[n.key];
          const pad = (k.black ? 0.08 : 0.14) * geo.width * W;
          const x = geo.left * W + pad, w = geo.width * W - pad * 2;
          const state = judged[i];
          g.globalAlpha = state === 'miss' ? 0.25 : state ? 0.15 : 1;
          g.fillStyle = k.color;
          roundRect(g, x, yBottom - len, w, len, Math.min(w / 2, 10 * dpr));
          g.fill();
          g.lineWidth = 2 * dpr;
          g.strokeStyle = k.light ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.5)';
          g.stroke();
          if (!state && style !== 'none' && w > 16 * dpr) {
            g.fillStyle = k.light ? '#4a4038' : '#fff';
            g.font = '600 ' + Math.round(Math.min(14 * dpr, w * 0.42)) + 'px Fredoka, system-ui, sans-serif';
            g.textAlign = 'center';
            g.fillText(ZP.notes.label(n.key, style, lang), x + w / 2, yBottom - 6 * dpr);
          }
          g.globalAlpha = 1;
        }
        // judgement pops
        pops = pops.filter(p => now - p.at < 0.7);
        pops.forEach(p => {
          const geo = lanes[p.key];
          const a = 1 - (now - p.at) / 0.7;
          g.globalAlpha = a;
          g.fillStyle = p.kind === 'perfect' ? '#E0A100' : p.kind === 'good' ? '#3E8E7E' : '#B05A5A';
          g.font = '700 ' + Math.round(16 * dpr) + 'px Fredoka, system-ui, sans-serif';
          g.textAlign = 'center';
          g.fillText(t('res.' + (p.kind === 'good' ? 'goodHit' : p.kind)), Math.min(Math.max((geo.left + geo.width / 2) * W, 40 * dpr), W - 40 * dpr), hitY - 30 * dpr - (1 - a) * 30 * dpr);
          g.globalAlpha = 1;
        });
      }

      function roundRect(g, x, y, w, h, r) {
        g.beginPath();
        g.moveTo(x + r, y);
        g.arcTo(x + w, y, x + w, y + h, r);
        g.arcTo(x + w, y + h, x, y + h, r);
        g.arcTo(x, y + h, x, y, r);
        g.arcTo(x, y, x + w, y, r);
        g.closePath();
      }

      draw(ZP.audio.now());
      return {
        stop() { if (playing) stopRun(false); sc.dispose(); },
        onMic() { if (micOn && guide) { guide = false; guideBtn.classList.remove('on'); } }
      };
    }

    setMode(mode);
  };
})(window.ZP);
