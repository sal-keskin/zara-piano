/* Mini games: Echo Memory, Note Detective, Rainbow Rush, High or Low. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el, clear, pick, shuffle } = ZP.util;
  const t = (k, v) => ZP.i18n.t(k, v);

  const GAMES = [
    { id: 'simon', emoji: '🧠', color: '#B9A8D8' },
    { id: 'detective', emoji: '🕵️', color: '#9FD3E6' },
    { id: 'rush', emoji: '⚡', color: '#F3CE7A' },
    { id: 'highlow', emoji: '🎢', color: '#A8C9BA' }
  ];

  ZP.views.games = function (root) {
    root.appendChild(ZP.ui.head('🎲 ' + t('nav.games')));
    root.appendChild(ZP.fx.bubble('happy', t('games.intro')));
    root.appendChild(el('div.game-grid', GAMES.map(g =>
      el('a.game-card', { href: '#/game/' + g.id, style: { '--gc': g.color } },
        el('span.game-emoji', g.emoji),
        el('b', t('game.' + g.id)),
        el('p', t('game.' + g.id + '.desc')),
        el('span.pill', '🏆 ' + t('games.best') + ': ' + (ZP.store.state.best[g.id] || 0)))),
    el('a.game-card', { href: '#/free?maker=1', style: { '--gc': '#F4C6D0' } },
      el('span.game-emoji', '✍️'), el('b', t('game.composer')), el('p', t('game.composer.desc')))));
  };

  ZP.views.game = function (root, route, S) {
    const g = GAMES.find(x => x.id === route.args[0]);
    if (!g) { location.hash = '#/games'; return; }
    root.appendChild(ZP.ui.head(g.emoji + ' ' + t('game.' + g.id), '#/games'));
    const say = el('div.lesson-say');
    const board = el('div.game-board');
    const piano = ZP.Piano();
    root.appendChild(el('div.lesson-stage', say, board));
    root.appendChild(el('div.piano-dock', piano.el));
    const ctx = { root, say, board, piano, S, setSay(mood, html) { clear(say).appendChild(ZP.fx.bubble(mood, html)); ZP.fx.speak(html); } };
    ({ simon: Simon, detective: Detective, rush: Rush, highlow: HighLow })[g.id](ctx);
  };

  function gameOver(game, score, ctx, again, extraLine) {
    const isBest = ZP.store.setBest(game, score);
    ZP.store.addXP(Math.min(80, 5 + score * 3), 'game');
    if (score > 0) ZP.audio.jingle(isBest ? 'win' : 'great');
    if (isBest && score > 0) ZP.fx.confetti(120);
    const m = ZP.fx.modal([
      ZP.fx.mascot(isBest ? 'wow' : 'happy', 100),
      el('h2', isBest && score > 0 ? '🏆 ' + t('games.newBest') : t('games.over')),
      el('p.big', t('games.score') + ': ' + score),
      extraLine ? el('p.muted', extraLine) : null,
      el('p.muted', t('games.best') + ': ' + ZP.store.state.best[game]),
      el('div.btn-row',
        el('button.btn.primary', { onclick: () => { m.close(); again(); } }, '🔁 ' + t('again')),
        el('a.btn.ghost', { href: '#/games', onclick: () => m.close() }, t('nav.games')))
    ], { cls: 'celebrate' });
  }

  // ── Echo Memory (Simon says) ──
  function Simon(ctx) {
    const { board, piano, S } = ctx;
    let seq = [], i = 0, busy = false, round = 0;
    const info = el('p.task-info');
    const startBtn = el('button.btn.primary.big', { onclick: begin }, '▶ ' + t('start'));
    board.append(info, startBtn);
    ctx.setSay('happy', t('game.simon.how'));

    function pool() {
      // starts on 5 white keys and grows
      if (round < 4) return ['C4', 'D4', 'E4', 'F4', 'G4'];
      if (round < 8) return ZP.lessons.WHITE.slice(0, 8);
      return ZP.notes.KEYS.map(k => k.id);
    }
    function begin() {
      seq = []; round = 0; startBtn.remove();
      next();
    }
    async function next() {
      round++;
      seq.push(pick(pool()));
      i = 0;
      busy = true;
      info.textContent = '👂 ' + t('game.round') + ' ' + round;
      ZP.input.blocked = true;
      await S.wait(700);
      const speed = Math.max(0.35, 0.7 - round * 0.025);
      const h = ZP.audio.sequence(seq.map((k, j) => ({ key: k, start: j * speed, dur: speed * 0.9 })), 60, { onNote: n => piano.flash(n.key, 'demo', speed * 900) });
      S.add(() => h.stop());
      await h.done;
      if (!S.alive) return;
      ZP.input.blocked = false;
      busy = false;
      info.textContent = '🎹 ' + t('echo.your') + ' (' + seq.length + ')';
    }
    S.on('note', nt => {
      if (busy || !seq.length) return;
      if (nt.key === seq[i]) {
        piano.flash(nt.key, 'good');
        i++;
        if (i >= seq.length) {
          busy = true;
          if (seq.length >= 5) ZP.store.award('simon-5');
          if (seq.length >= 10) ZP.store.award('simon-10');
          ZP.audio.jingle('good');
          ctx.setSay('wow', ZP.util.pick(t('praise').split('|')));
          S.timeout(next, 800);
        }
      } else {
        piano.flash(nt.key, 'bad');
        piano.flash(seq[i], 'nudge', 900);
        busy = true;
        ZP.audio.jingle('bad');
        const score = seq.length - 1;
        seq = [];
        S.timeout(() => gameOver('simon', score, ctx, () => { board.appendChild(startBtn); begin(); }), 900);
      }
    });
  }

  // ── Note Detective: hear a note, find it among the glowing keys ──
  function Detective(ctx) {
    const { board, piano, S } = ctx;
    let target = null, choices = [], streak = 0, score = 0, lives = 3, busy = true;
    const info = el('p.task-info');
    const livesEl = el('span.pill');
    const replay = el('button.btn.ghost', { onclick: () => target && playTarget() }, '🔊 ' + t('listenAgain'));
    const startBtn = el('button.btn.primary.big', { onclick: begin }, '▶ ' + t('start'));
    board.append(info, el('div.btn-row', livesEl, replay), startBtn);
    ctx.setSay('happy', t('game.detective.how'));
    const drawLives = () => { livesEl.textContent = '❤️'.repeat(lives) + '🤍'.repeat(3 - lives) + '  ⭐ ' + score; };
    drawLives();

    function begin() { startBtn.remove(); score = 0; streak = 0; lives = 3; drawLives(); round(); }
    function playTarget() {
      ZP.input.blocked = true;
      ZP.audio.play(target);
      S.timeout(() => { ZP.input.blocked = false; }, 450);
    }
    function round() {
      busy = false;
      const n = Math.min(2 + Math.floor(score / 3), 6);
      const white = ZP.lessons.WHITE;
      // start with far-apart keys, get closer as you improve
      const all = score < 6 ? white.filter((_, i) => i % 2 === 0) : score < 12 ? white : ZP.notes.KEYS.map(k => k.id);
      choices = shuffle(all).slice(0, n);
      target = pick(choices);
      piano.highlight(choices, 'show');
      piano.clear('target');
      info.textContent = '🕵️ ' + t('game.detective.find', { n: choices.length });
      S.timeout(playTarget, 400);
    }
    S.on('note', nt => {
      if (busy || !target) return;
      if (!choices.includes(nt.key)) return;
      busy = true;
      if (nt.key === target) {
        piano.flash(nt.key, 'good');
        score++; streak++;
        if (streak >= 8) ZP.store.award('detective');
        ZP.audio.jingle('good');
        drawLives();
        S.timeout(round, 900);
      } else {
        piano.flash(nt.key, 'bad');
        piano.flash(target, 'nudge', 1200);
        streak = 0;
        lives--;
        drawLives();
        S.timeout(() => {
          ZP.audio.play(target);
          if (lives <= 0) { piano.clear('show'); target = null; gameOver('detective', score, ctx, begin); }
          else S.timeout(round, 900);
        }, 500);
      }
    });
  }

  // ── Rainbow Rush: a big dot appears, press its key as fast as you can ──
  function Rush(ctx) {
    const { board, piano, S } = ctx;
    const lang = ZP.store.setting('lang');
    let target = null, score = 0, end = 0, raf = 0, running = false;
    const bigDot = el('div.rush-dot');
    const label = el('p.rush-label');
    const timer = el('div.progress.timer', el('span'));
    const scoreEl = el('span.pill', '⭐ 0');
    const startBtn = el('button.btn.primary.big', { onclick: begin }, '▶ ' + t('start'));
    board.append(timer, el('div.rush-area', bigDot, label), scoreEl, startBtn);
    ctx.setSay('happy', t('game.rush.how'));

    function newTarget() {
      const pool = score < 8 ? ZP.lessons.WHITE : ZP.notes.KEYS.map(k => k.id);
      let n;
      do { n = pick(pool); } while (n === target);
      target = n;
      const k = ZP.notes.BY_ID[n];
      bigDot.style.setProperty('--c', k.color);
      bigDot.className = 'rush-dot pop' + (k.light ? ' light' : '') + (k.glitter ? ' glitter' : '');
      void bigDot.offsetWidth;
      const style = ZP.store.setting('labels');
      label.textContent = k.colorName[lang] + (score < 5 && style !== 'none' ? ' · ' + ZP.notes.label(n, style, lang) : '');
    }
    function begin() {
      startBtn.remove();
      score = 0;
      scoreEl.textContent = '⭐ 0';
      end = performance.now() + 45000;
      running = true;
      newTarget();
      tick();
    }
    function tick() {
      const left = end - performance.now();
      timer.firstChild.style.width = Math.max(0, left / 450) + '%';
      if (left <= 0) return finish();
      raf = requestAnimationFrame(tick);
    }
    function finish() {
      running = false;
      target = null;
      bigDot.className = 'rush-dot';
      label.textContent = '';
      if (score >= 25) ZP.store.award('rush');
      gameOver('rush', score, ctx, () => { begin(); });
    }
    S.add(() => cancelAnimationFrame(raf));
    S.on('note', nt => {
      if (!running) return;
      if (nt.key === target) {
        piano.flash(nt.key, 'good');
        score++;
        scoreEl.textContent = '⭐ ' + score;
        newTarget();
      } else {
        piano.flash(nt.key, 'bad');
        end -= 1500; // small time penalty
      }
    });
  }

  // ── High or Low: two notes, is the second one higher or lower? ──
  function HighLow(ctx) {
    const { board, piano, S } = ctx;
    let a, b, score = 0, lives = 3, busy = true;
    const info = el('p.task-info');
    const livesEl = el('span.pill');
    const btns = el('div.quiz-opts.hl',
      el('button.btn.quiz.big', { onclick: () => answer('low') }, '⬇️ ' + t('hl.lower')),
      el('button.btn.quiz.big', { onclick: () => answer('high') }, '⬆️ ' + t('hl.higher')));
    const replay = el('button.btn.ghost', { onclick: () => a && playPair() }, '🔊 ' + t('listenAgain'));
    const startBtn = el('button.btn.primary.big', { onclick: begin }, '▶ ' + t('start'));
    board.append(info, btns, el('div.btn-row', livesEl, replay), startBtn);
    ctx.setSay('happy', t('game.highlow.how'));
    const draw = () => { livesEl.textContent = '❤️'.repeat(lives) + '🤍'.repeat(3 - lives) + '  ⭐ ' + score; };
    draw();
    function begin() { startBtn.remove(); score = 0; lives = 3; draw(); round(); }
    function playPair() {
      busy = true;
      const h = ZP.audio.sequence([{ key: a, start: 0, dur: 0.9 }, { key: b, start: 1.1, dur: 1 }], 60, { onNote: n => piano.flash(n.key, 'demo', 600) });
      S.add(() => h.stop());
      h.done.then(() => { busy = false; });
    }
    function round() {
      const ids = ZP.notes.KEYS.map(k => k.id);
      const gap = Math.max(1, 9 - Math.floor(score / 2)); // gets closer = harder
      do {
        a = pick(ids);
        const ia = ids.indexOf(a);
        const ib = ia + (Math.random() < 0.5 ? -gap : gap);
        b = ids[ib];
      } while (!b);
      info.textContent = '👂 ' + t('game.highlow.q');
      S.timeout(playPair, 500);
    }
    function answer(dir) {
      if (busy || !a) return;
      busy = true;
      const right = (ZP.notes.BY_ID[b].midi > ZP.notes.BY_ID[a].midi ? 'high' : 'low') === dir;
      piano.flash(a, 'show', 1200);
      piano.flash(b, right ? 'good' : 'bad', 1200);
      if (right) {
        score++;
        if (score >= 10) ZP.store.award('highlow');
        ZP.audio.jingle('good');
      } else {
        lives--;
        ZP.audio.jingle('bad');
      }
      draw();
      S.timeout(() => {
        if (lives <= 0) { a = null; gameOver('highlow', score, ctx, begin); }
        else round();
      }, 1100);
    }
  }
})(window.ZP);
