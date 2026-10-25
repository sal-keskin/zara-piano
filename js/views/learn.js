/* Lessons: the learning path and the step-by-step lesson player. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el, clear } = ZP.util;
  const t = (k, v) => ZP.i18n.t(k, v);
  const tx = o => ZP.i18n.tx(o);
  const L = () => ZP.lessons.LESSONS;

  function unlocked(i) {
    if (ZP.store.setting('unlockAll') || i === 0) return true;
    return !!ZP.store.state.lessons[L()[i - 1].id];
  }

  ZP.views.learn = function (root) {
    root.appendChild(ZP.ui.head('🎓 ' + t('nav.learn')));
    root.appendChild(ZP.fx.bubble('happy', t('learn.intro')));
    const path = el('ol.path');
    L().forEach((l, i) => {
      const done = !!ZP.store.state.lessons[l.id];
      const open = unlocked(i);
      path.appendChild(el('li.path-node' + (done ? '.done' : '') + (open ? '' : '.locked') + (open && !done ? '.next' : ''),
        el(open ? 'a' : 'span', open ? { href: '#/lesson/' + l.id } : {},
          el('span.node-circle', done ? '✓' : open ? l.emoji : '🔒'),
          el('span.node-text',
            el('small', t('learn.lesson') + ' ' + (i + 1)),
            el('b', tx(l.title)),
            el('small.muted', l.steps.length + ' ' + t('learn.steps') + ' · +' + l.xp + ' XP')))));
    });
    root.appendChild(path);
    root.appendChild(el('a.card.row-card', { href: '#/chart' }, el('span.tile-ico', '🎨'), el('div', el('b', t('chart.title')), el('p.muted', t('home.tile.chart')))));
  };

  ZP.views.lesson = function (root, route, S) {
    const idx = L().findIndex(l => l.id === route.args[0]);
    const lesson = L()[idx];
    if (!lesson) { location.hash = '#/learn'; return; }
    const lang = ZP.store.setting('lang');

    const dots = el('div.step-dots', lesson.steps.map(() => el('span')));
    root.appendChild(ZP.ui.head(lesson.emoji + ' ' + tx(lesson.title), '#/learn', dots));
    const say = el('div.lesson-say');
    const task = el('div.lesson-task');
    const piano = ZP.Piano();
    root.appendChild(el('div.lesson-stage', say, task));
    root.appendChild(el('div.piano-dock', piano.el));

    let step = -1;
    let stepScope = null;

    function speakBtn(text) {
      return el('button.icon-btn', { onclick: () => ZP.fx.speak(text, true), 'aria-label': t('readAloud'), title: t('readAloud') }, '🔊');
    }

    function setSay(mood, text) {
      clear(say).appendChild(el('div.bubble-row', ZP.fx.mascot(mood, 76), el('div.bubble', el('span', { html: text }), speakBtn(text))));
    }

    function praise() {
      return ZP.util.pick(t('praise').split('|'));
    }

    function success(auto) {
      if (!stepScope) return;
      piano.clear('target');
      ZP.audio.jingle('good');
      setSay('wow', '🎉 ' + praise());
      ZP.fx.speak(praise());
      const sc = stepScope;
      if (auto !== false) sc.timeout(() => go(step + 1), 1100);
    }

    function hintDir(target, played) {
      const a = ZP.notes.BY_ID[target].midi, b = ZP.notes.BY_ID[played].midi;
      return a > b ? t('hint.right') : t('hint.left');
    }

    function dotRow(notes, progress, hidden) {
      return el('div.seq-row', notes.map((n, i) => {
        if (hidden && i >= progress) return el('span.ndot.mystery', '?');
        return ZP.dot(n.key, i < progress ? 'done' : i === progress ? 'now' : '');
      }));
    }

    function go(n) {
      if (stepScope) stepScope.dispose();
      ZP.input.blocked = false;
      piano.clear('target'); piano.clear('show'); piano.clear('done'); piano.clear('demo');
      step = n;
      Array.from(dots.children).forEach((d, i) => d.className = i < n ? 'done' : i === n ? 'now' : '');
      if (n >= lesson.steps.length) return finish();
      stepScope = ZP.util.scope();
      S.add(() => stepScope && stepScope.dispose());
      const st = lesson.steps[n];
      const text = tx(st.text);
      setSay('happy', text);
      ZP.fx.speak(text);
      clear(task);
      (STEP[st.type] || STEP.info)(st, stepScope);
    }

    const STEP = {
      info(st) {
        if (st.show) piano.highlight(st.show, 'show');
        if (st.hand) task.appendChild(handDiagram());
        task.appendChild(el('button.btn.primary.big', { onclick: () => go(step + 1) }, t('next') + ' ▶'));
      },

      press(st, sc) {
        let count = 0;
        const need = st.times || 1;
        piano.highlight(st.keys, 'target');
        const info = el('p.task-info', st.keys.map(k => ZP.dot(k, 'lg')));
        task.appendChild(info);
        sc.on('note', nt => {
          if (st.keys.includes(nt.key)) {
            piano.flash(nt.key, 'good');
            if (++count >= need) success();
          } else {
            piano.flash(nt.key, 'bad');
            setSay('think', hintDir(st.keys[0], nt.key) + ' ' + t('hint.find', { c: ZP.notes.BY_ID[st.keys[0]].colorName[lang] }));
          }
        });
      },

      each(st, sc) {
        const left = new Set(st.keys);
        piano.highlight(st.keys, 'target');
        const row = el('div.seq-row');
        const draw = () => { clear(row); st.keys.forEach(k => row.appendChild(ZP.dot(k, left.has(k) ? 'lg' : 'lg.done'))); };
        draw();
        task.appendChild(row);
        sc.on('note', nt => {
          if (left.has(nt.key)) {
            left.delete(nt.key);
            piano.keyEl(nt.key).classList.remove('target');
            piano.flash(nt.key, 'good');
            draw();
            if (!left.size) success();
          } else if (!st.keys.includes(nt.key)) {
            piano.flash(nt.key, 'bad');
          }
        });
      },

      sequence(st, sc) {
        const notes = ZP.audio.parse(st.notes).filter(x => !x.rest);
        let i = 0;
        const wrap = el('div');
        task.appendChild(wrap);
        const draw = () => {
          clear(wrap).appendChild(dotRow(notes, i));
          if (notes[i]) piano.highlight(notes[i].key, 'target');
        };
        draw();
        task.appendChild(el('button.btn.ghost', { onclick: () => demo(notes, sc) }, '👂 ' + t('showMe')));
        sc.on('note', nt => {
          if (!notes[i]) return;
          if (nt.key === notes[i].key) {
            piano.flash(nt.key, 'good');
            i++;
            draw();
            if (i >= notes.length) success();
          } else {
            piano.flash(nt.key, 'bad');
            setSay('think', hintDir(notes[i].key, nt.key));
          }
        });
      },

      echo(st, sc) {
        const notes = ZP.audio.parse(st.notes).filter(x => !x.rest);
        const all = ZP.audio.parse(st.notes);
        let i = 0, fails = 0, listening = false;
        const wrap = el('div');
        const status = el('p.task-info');
        task.appendChild(status);
        task.appendChild(wrap);
        const draw = () => clear(wrap).appendChild(dotRow(notes, i, fails < 2));
        const listen = async () => {
          listening = true;
          i = 0;
          draw();
          status.textContent = '👂 ' + t('echo.listen');
          ZP.input.blocked = true;
          const bpm = 92;
          const h = ZP.audio.sequence(all, bpm, { onNote: n => piano.flash(n.key, 'demo', 400) });
          sc.add(() => h.stop());
          await h.done;
          if (!sc.alive) return;
          ZP.input.blocked = false;
          listening = false;
          status.textContent = '🎹 ' + t('echo.your');
          if (fails >= 2) piano.highlight(notes[0].key, 'target');
        };
        task.appendChild(el('button.btn.ghost', { onclick: () => !listening && listen() }, '🔁 ' + t('echo.again')));
        draw();
        sc.timeout(listen, 600);
        sc.on('note', nt => {
          if (listening || !notes[i]) return;
          if (nt.key === notes[i].key) {
            piano.flash(nt.key, 'good');
            i++;
            draw();
            if (fails >= 2 && notes[i]) piano.highlight(notes[i].key, 'target');
            if (i >= notes.length) success();
          } else {
            piano.flash(nt.key, 'bad');
            fails++;
            setSay('think', t('echo.oops'));
            piano.clear('target');
            sc.timeout(listen, 900);
            listening = true;
          }
        });
      },

      quiz(st, sc) {
        const play = () => {
          if (!st.play) return;
          ZP.input.blocked = true;
          const h = ZP.audio.sequence(ZP.audio.parse(st.play), 90, { onNote: n => piano.flash(n.key, 'demo', 400) });
          sc.add(() => h.stop());
          h.done.then(() => { ZP.input.blocked = false; });
        };
        if (st.play) {
          task.appendChild(el('button.btn.ghost', { onclick: play }, '🔊 ' + t('listenAgain')));
          sc.timeout(play, 500);
        }
        const opts = el('div.quiz-opts');
        st.options.forEach((o, i) => {
          const b = el('button.btn.quiz', {
            onclick: () => {
              if (i === st.answer) { b.classList.add('right'); success(); }
              else { b.classList.add('wrong'); ZP.audio.jingle('bad'); setSay('think', t('quiz.again')); setTimeout(() => b.classList.remove('wrong'), 600); }
            }
          }, tx(o));
          opts.appendChild(b);
        });
        task.appendChild(opts);
      },

      mic(st, sc) {
        let heard = 0;
        const status = el('p.task-info', '🎤 …');
        const row = el('div.seq-row');
        task.appendChild(status);
        task.appendChild(row);
        task.appendChild(el('button.btn.ghost', { onclick: () => go(step + 1) }, t('skip') + ' ⏭'));
        if (!ZP.pitch.supported()) { status.textContent = t('mic.unsupported'); return; }
        ZP.pitch.start().then(() => {
          status.textContent = '🎤 ' + t('mic.listening');
        }).catch(() => { status.textContent = t('mic.denied'); });
        sc.add(() => ZP.pitch.stop());
        sc.on('note', nt => {
          if (nt.source !== 'mic') return;
          heard++;
          row.appendChild(ZP.dot(nt.key, 'lg'));
          status.textContent = '🎤 ' + ZP.notes.label(nt.key, ZP.store.setting('labels'), lang) + ' — ' + ZP.notes.BY_ID[nt.key].colorName[lang] + '!';
          if (heard >= (st.count || 3)) { ZP.pitch.stop(); success(); }
        });
      }
    };

    function demo(notes, sc) {
      ZP.input.blocked = true;
      const h = ZP.audio.sequence(notes.map((n, i) => ({ key: n.key, start: i * 0.8, dur: 0.7 })), 80, { onNote: n => piano.flash(n.key, 'demo', 500) });
      sc.add(() => h.stop());
      h.done.then(() => { ZP.input.blocked = false; });
    }

    function handDiagram() {
      return el('div.hand',
        el('div.hand-keys', ['C4', 'D4', 'E4', 'F4', 'G4'].map((k, i) =>
          el('div.hand-key', el('span.finger-num', String(i + 1)), ZP.dot(k, 'lg'), el('small', ZP.notes.label(k, ZP.store.setting('labels') === 'none' ? 'letters' : ZP.store.setting('labels'), lang))))),
        el('small.muted', t('hand.caption')));
    }

    function finish() {
      clear(task);
      const first = ZP.store.completeLesson(lesson.id);
      ZP.audio.jingle('win');
      ZP.fx.confetti(160);
      if (first) ZP.store.addXP(lesson.xp, 'lesson');
      else ZP.store.addXP(10, 'lesson');
      setSay('wow', '🏆 ' + t('lesson.done', { title: tx(lesson.title) }));
      ZP.fx.speak(t('lesson.done', { title: tx(lesson.title) }));
      const nextL = L()[idx + 1];
      task.appendChild(el('div.btn-row',
        nextL ? el('a.btn.primary.big', { href: '#/lesson/' + nextL.id }, t('learn.next') + ' ▶') : el('a.btn.primary.big', { href: '#/songs' }, t('nav.songs') + ' 🎶'),
        el('button.btn', { onclick: () => go(0) }, '🔁 ' + t('again')),
        el('a.btn.ghost', { href: '#/learn' }, t('learn.all'))));
    }

    go(0);
  };
})(window.ZP);
